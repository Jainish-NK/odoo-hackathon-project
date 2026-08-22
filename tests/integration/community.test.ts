import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('Community and sharing', () => {
  let app: Express;

  const emailA = `community.a.${Date.now()}@globetrotter.dev`;
  const emailB = `community.b.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';
  const suffix = Date.now();

  let tokenA: string;
  let tokenB: string;
  let cityId: string;
  const tripIds: string[] = [];

  beforeAll(async () => {
    app = createApp();

    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailA, password, name: 'Community A' }),
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailB, password, name: 'Community B' }),
    ]);
    tokenA = resA.body.data.tokens.accessToken;
    tokenB = resB.body.data.tokens.accessToken;

    const city = await prisma.city.create({
      data: { name: `CommunityCity-${suffix}`, country: 'Testland' },
    });
    cityId = city.id;
  });

  afterAll(async () => {
    await prisma.trip.deleteMany({ where: { id: { in: tripIds } } });
    await prisma.city.deleteMany({ where: { id: cityId } });
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await prisma.$disconnect();
  });

  describe('Private trips are never exposed publicly', () => {
    let privateTripId: string;

    it('creates a private trip', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: `Private Trip ${suffix}`, startDate: '2026-05-01', endDate: '2026-05-05' });
      privateTripId = res.body.data.id;
      tripIds.push(privateTripId);
      expect(res.body.data.visibility).toBe('PRIVATE');
    });

    it('does not appear in the community listing', async () => {
      const res = await request(app).get(
        `/api/v1/community/trips?search=${encodeURIComponent(`Private Trip ${suffix}`)}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('returns 404 from the community detail endpoint', async () => {
      const res = await request(app).get(`/api/v1/community/trips/${privateTripId}`);
      expect(res.status).toBe(404);
    });

    it("cannot be copied by another user", async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${privateTripId}/copy`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({});
      expect(res.status).toBe(403);
    });
  });

  describe('Public trips, sharing, and copying', () => {
    let publicTripId: string;
    let publicShareSlug: string;

    it('creates a trip and makes it public via the dedicated visibility endpoint', async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: `Public Trip ${suffix}`, startDate: '2026-06-01', endDate: '2026-06-05' });
      publicTripId = createRes.body.data.id;
      tripIds.push(publicTripId);

      await request(app)
        .post(`/api/v1/trips/${publicTripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ cityId, startDate: '2026-06-01', endDate: '2026-06-05' });

      const visRes = await request(app)
        .patch(`/api/v1/trips/${publicTripId}/visibility`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ visibility: 'PUBLIC' });

      expect(visRes.status).toBe(200);
      expect(visRes.body.data.visibility).toBe('PUBLIC');
      expect(visRes.body.data.shareSlug).toEqual(expect.any(String));
      publicShareSlug = visRes.body.data.shareSlug;
    });

    it('appears in the community listing with safe, public-only fields', async () => {
      const res = await request(app).get(
        `/api/v1/community/trips?search=${encodeURIComponent(`Public Trip ${suffix}`)}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);

      const trip = res.body.data[0];
      expect(trip.id).toBe(publicTripId);
      expect(trip.owner).toMatchObject({ id: expect.any(String), name: 'Community A' });
      expect(trip.owner).not.toHaveProperty('email');
      expect(trip).not.toHaveProperty('budgetAmount');
      expect(trip).not.toHaveProperty('userId');
    });

    it('is retrievable via the community detail endpoint without authentication', async () => {
      const res = await request(app).get(`/api/v1/community/trips/${publicTripId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(`Public Trip ${suffix}`);
      expect(Array.isArray(res.body.data.stops)).toBe(true);
    });

    it('is retrievable via its stable public share link without authentication', async () => {
      const res = await request(app).get(`/api/v1/public/trips/${publicShareSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(publicTripId);
    });

    it('returns 404 for an unknown share link', async () => {
      const res = await request(app).get('/api/v1/public/trips/not-a-real-slug-xyz');
      expect(res.status).toBe(404);
    });

    it('stops being publicly reachable once switched back to private', async () => {
      await request(app)
        .patch(`/api/v1/trips/${publicTripId}/visibility`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ visibility: 'PRIVATE' });

      const byId = await request(app).get(`/api/v1/community/trips/${publicTripId}`);
      expect(byId.status).toBe(404);

      // the old share link must not leak the now-private trip either, even
      // though the slug itself is still stored on the row.
      const byShareSlug = await request(app).get(`/api/v1/public/trips/${publicShareSlug}`);
      expect(byShareSlug.status).toBe(404);

      // restore to PUBLIC for the copy tests below
      await request(app)
        .patch(`/api/v1/trips/${publicTripId}/visibility`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ visibility: 'PUBLIC' });
    });

    it('lets another user copy it into their own independent trip', async () => {
      const beforeStops = await prisma.tripStop.count({ where: { tripId: publicTripId } });

      const copyRes = await request(app)
        .post(`/api/v1/trips/${publicTripId}/copy`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({});

      expect(copyRes.status).toBe(201);
      expect(copyRes.body.data.id).not.toBe(publicTripId);
      tripIds.push(copyRes.body.data.id);

      const copiedTrip = await prisma.trip.findUnique({ where: { id: copyRes.body.data.id } });
      expect(copiedTrip?.userId).not.toBe(
        (await prisma.trip.findUnique({ where: { id: publicTripId } }))?.userId,
      );
      expect(copiedTrip?.copiedFromId).toBe(publicTripId);
      expect(copiedTrip?.visibility).toBe('PRIVATE');

      // independent stops: modifying the copy must never touch the original
      const copiedStopsBefore = await prisma.tripStop.count({
        where: { tripId: copyRes.body.data.id },
      });
      expect(copiedStopsBefore).toBe(beforeStops);

      const copiedStops = await request(app)
        .get(`/api/v1/trips/${copyRes.body.data.id}/stops`)
        .set('Authorization', `Bearer ${tokenB}`);
      await request(app)
        .delete(`/api/v1/trips/${copyRes.body.data.id}/stops/${copiedStops.body.data[0].id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      const originalStopsAfter = await prisma.tripStop.count({ where: { tripId: publicTripId } });
      expect(originalStopsAfter).toBe(beforeStops);

      const originalTripAfter = await prisma.trip.findUnique({ where: { id: publicTripId } });
      expect(originalTripAfter?.name).toBe(`Public Trip ${suffix}`);
    });
  });

  describe('GET /api/v1/community/trips filters, sort, and pagination', () => {
    const groupTag = `CommGroup-${suffix}`;
    let popularId: string;
    let quietId: string;

    beforeAll(async () => {
      const popular = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: `${groupTag} Popular`,
          startDate: '2026-07-01',
          endDate: '2026-07-03',
          visibility: 'PUBLIC',
        });
      popularId = popular.body.data.id;
      tripIds.push(popularId);

      const quiet = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: `${groupTag} Quiet`,
          startDate: '2026-07-01',
          endDate: '2026-07-03',
          visibility: 'PUBLIC',
        });
      quietId = quiet.body.data.id;
      tripIds.push(quietId);

      // "popular" is approximated by copy count — copy the popular trip
      // twice (as two different users) so it outranks the quiet one.
      const firstCopy = await request(app)
        .post(`/api/v1/trips/${popularId}/copy`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({});
      tripIds.push(firstCopy.body.data.id);
      const secondCopy = await request(app)
        .post(`/api/v1/trips/${popularId}/copy`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({});
      tripIds.push(secondCopy.body.data.id);
    });

    it('paginates results', async () => {
      const page1 = await request(app).get(
        `/api/v1/community/trips?search=${encodeURIComponent(groupTag)}&limit=1&page=1`,
      );
      const page2 = await request(app).get(
        `/api/v1/community/trips?search=${encodeURIComponent(groupTag)}&limit=1&page=2`,
      );

      expect(page1.body.meta.total).toBe(2);
      expect(page1.body.data).toHaveLength(1);
      expect(page2.body.data).toHaveLength(1);
      expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
    });

    it('filters by city', async () => {
      // neither trip has a stop in `cityId` yet — filtering by it must
      // exclude both, distinguishing the filter from a no-op.
      const res = await request(app).get(
        `/api/v1/community/trips?search=${encodeURIComponent(groupTag)}&city=${cityId}`,
      );
      expect(res.body.data).toHaveLength(0);
    });

    it('sorts by popularity (copy count) when requested', async () => {
      const res = await request(app).get(
        `/api/v1/community/trips?search=${encodeURIComponent(groupTag)}&sort=popular`,
      );
      expect(res.status).toBe(200);
      expect(res.body.data[0].id).toBe(popularId);
      expect(res.body.data[1].id).toBe(quietId);
    });
  });
});
