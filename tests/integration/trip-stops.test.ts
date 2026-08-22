import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('Trip stops', () => {
  let app: Express;

  const emailA = `stops.a.${Date.now()}@globetrotter.dev`;
  const emailB = `stops.b.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let tripId: string;
  let cityParisId: string;
  let cityRomeId: string;

  beforeAll(async () => {
    app = createApp();

    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailA, password, name: 'Stops A' }),
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailB, password, name: 'Stops B' }),
    ]);
    tokenA = resA.body.data.tokens.accessToken;
    tokenB = resB.body.data.tokens.accessToken;

    const suffix = Date.now();
    const [paris, rome] = await Promise.all([
      prisma.city.create({ data: { name: `StopParis-${suffix}`, country: 'Testland' } }),
      prisma.city.create({ data: { name: `StopRome-${suffix}`, country: 'Testland' } }),
    ]);
    cityParisId = paris.id;
    cityRomeId = rome.id;

    const tripRes = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Stops Trip', startDate: '2026-06-01', endDate: '2026-06-20' });
    tripId = tripRes.body.data.id;
  });

  afterAll(async () => {
    // Trip deleted first so cascading TripStop rows release their City
    // foreign keys (City -> TripStop is onDelete: Restrict) before the
    // cities themselves are removed.
    await prisma.trip.deleteMany({ where: { id: tripId } });
    await prisma.city.deleteMany({ where: { id: { in: [cityParisId, cityRomeId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/trips/:tripId/stops', () => {
    it('creates a stop for the trip owner', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ cityId: cityParisId, startDate: '2026-06-01', endDate: '2026-06-05' });

      expect(res.status).toBe(201);
      expect(res.body.data.cityId).toBe(cityParisId);
      expect(res.body.data.position).toBe(0);
    });

    it('rejects a nonexistent city', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          cityId: '00000000-0000-0000-0000-000000000000',
          startDate: '2026-06-05',
          endDate: '2026-06-08',
        });

      expect(res.status).toBe(404);
    });

    it('rejects a stop end date before its start date', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ cityId: cityRomeId, startDate: '2026-06-10', endDate: '2026-06-08' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it("rejects stop dates outside the trip's date range", async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ cityId: cityRomeId, startDate: '2026-05-25', endDate: '2026-06-02' });

      expect(res.status).toBe(400);
    });

    it("prevents a non-owner from adding a stop to someone else's trip", async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ cityId: cityRomeId, startDate: '2026-06-06', endDate: '2026-06-10' });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/trips/:tripId/stops/reorder', () => {
    it('persists a new stop order via a transaction', async () => {
      const secondStop = await request(app)
        .post(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ cityId: cityRomeId, startDate: '2026-06-06', endDate: '2026-06-10' });

      const listRes = await request(app)
        .get(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(listRes.body.data).toHaveLength(2);

      const [first, second] = listRes.body.data;
      expect(second.id).toBe(secondStop.body.data.id);

      const reorderRes = await request(app)
        .patch(`/api/v1/trips/${tripId}/stops/reorder`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          order: [
            { stopId: first.id, position: 1 },
            { stopId: second.id, position: 0 },
          ],
        });

      expect(reorderRes.status).toBe(200);

      const afterRes = await request(app)
        .get(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(afterRes.body.data[0].id).toBe(second.id);
      expect(afterRes.body.data[1].id).toBe(first.id);
    });

    it('rejects a reorder payload that omits an existing stop', async () => {
      const listRes = await request(app)
        .get(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`);
      const [first] = listRes.body.data;

      const res = await request(app)
        .patch(`/api/v1/trips/${tripId}/stops/reorder`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ order: [{ stopId: first.id, position: 0 }] });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/v1/trips/:tripId/stops/:stopId', () => {
    it('deletes a stop for the owner', async () => {
      const listRes = await request(app)
        .get(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`);
      const [stop] = listRes.body.data;

      const delRes = await request(app)
        .delete(`/api/v1/trips/${tripId}/stops/${stop.id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(delRes.status).toBe(200);

      const afterRes = await request(app)
        .get(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(afterRes.body.data.find((s: { id: string }) => s.id === stop.id)).toBeUndefined();
    });

    it("prevents a non-owner from deleting another user's trip stop", async () => {
      const listRes = await request(app)
        .get(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${tokenA}`);
      const [stop] = listRes.body.data;

      const res = await request(app)
        .delete(`/api/v1/trips/${tripId}/stops/${stop.id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(403);
    });
  });
});
