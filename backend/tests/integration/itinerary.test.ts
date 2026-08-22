import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('Itinerary', () => {
  let app: Express;

  const email = `itinerary.${Date.now()}@globetrotter.dev`;
  const otherEmail = `itinerary.other.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  let token: string;
  let otherToken: string;
  let tripId: string;
  let stopId: string;
  let cityId: string;
  let activityAId: string;
  let activityBId: string;
  let tripActivityAId: string;
  let tripActivityBId: string;

  beforeAll(async () => {
    app = createApp();

    const [regRes, otherRegRes] = await Promise.all([
      request(app)
        .post('/api/v1/auth/register')
        .send({ email, password, name: 'Itinerary Tester' }),
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: otherEmail, password, name: 'Itinerary Intruder' }),
    ]);
    token = regRes.body.data.tokens.accessToken;
    otherToken = otherRegRes.body.data.tokens.accessToken;

    const suffix = Date.now();
    const city = await prisma.city.create({
      data: { name: `ItinCity-${suffix}`, country: 'Testland' },
    });
    cityId = city.id;

    const [activityA, activityB] = await Promise.all([
      prisma.activity.create({
        data: { cityId, name: `Itin Activity A ${suffix}`, category: 'SIGHTSEEING', cost: 10 },
      }),
      prisma.activity.create({
        data: { cityId, name: `Itin Activity B ${suffix}`, category: 'FOOD_AND_DRINK', cost: 20 },
      }),
    ]);
    activityAId = activityA.id;
    activityBId = activityB.id;

    const tripRes = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Itinerary Trip', startDate: '2026-08-01', endDate: '2026-08-05' });
    tripId = tripRes.body.data.id;

    const stopRes = await request(app)
      .post(`/api/v1/trips/${tripId}/stops`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cityId, startDate: '2026-08-01', endDate: '2026-08-05' });
    stopId = stopRes.body.data.id;

    const taA = await request(app)
      .post(`/api/v1/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stopId, activityId: activityAId, date: '2026-08-02', position: 0 });
    tripActivityAId = taA.body.data.id;

    const taB = await request(app)
      .post(`/api/v1/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stopId, activityId: activityBId, date: '2026-08-02', position: 1 });
    tripActivityBId = taB.body.data.id;
  });

  afterAll(async () => {
    await prisma.trip.deleteMany({ where: { id: tripId } });
    await prisma.activity.deleteMany({ where: { id: { in: [activityAId, activityBId] } } });
    await prisma.city.deleteMany({ where: { id: cityId } });
    await prisma.user.deleteMany({ where: { email: { in: [email, otherEmail] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/trips/:tripId/itinerary', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get(`/api/v1/trips/${tripId}/itinerary`);
      expect(res.status).toBe(401);
    });

    it('returns a day-wise breakdown spanning the full trip range', async () => {
      const res = await request(app)
        .get(`/api/v1/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tripId).toBe(tripId);
      // 2026-08-01 through 2026-08-05 inclusive = 5 days, even though only
      // one day has activities — the backend builds the full day skeleton.
      expect(res.body.data.days).toHaveLength(5);

      const day2 = res.body.data.days.find((d: { date: string }) => d.date === '2026-08-02');
      expect(day2.activities).toHaveLength(2);
      expect(day2.activities[0].id).toBe(tripActivityAId);
      expect(day2.activities[1].id).toBe(tripActivityBId);
      expect(day2.activities[0].city.id).toBe(cityId);

      const emptyDay = res.body.data.days.find((d: { date: string }) => d.date === '2026-08-01');
      expect(emptyDay.activities).toHaveLength(0);
    });

    it('returns 404 for a nonexistent trip', async () => {
      const res = await request(app)
        .get('/api/v1/trips/00000000-0000-0000-0000-000000000000/itinerary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it("prevents another user from viewing this trip's itinerary", async () => {
      const res = await request(app)
        .get(`/api/v1/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/trips/:tripId/itinerary/reorder', () => {
    it('reorders activities within a day and persists the change', async () => {
      const res = await request(app)
        .patch(`/api/v1/trips/${tripId}/itinerary/reorder`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            { tripActivityId: tripActivityAId, position: 1 },
            { tripActivityId: tripActivityBId, position: 0 },
          ],
        });

      expect(res.status).toBe(200);
      const day2 = res.body.data.days.find((d: { date: string }) => d.date === '2026-08-02');
      expect(day2.activities[0].id).toBe(tripActivityBId);
      expect(day2.activities[1].id).toBe(tripActivityAId);
    });

    it('rejects an itinerary item that does not belong to this trip', async () => {
      const res = await request(app)
        .patch(`/api/v1/trips/${tripId}/itinerary/reorder`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ tripActivityId: '00000000-0000-0000-0000-000000000000', position: 0 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it("prevents another user from reordering this trip's itinerary", async () => {
      const res = await request(app)
        .patch(`/api/v1/trips/${tripId}/itinerary/reorder`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          items: [{ tripActivityId: tripActivityAId, position: 0 }],
        });

      expect(res.status).toBe(403);

      const unchanged = await prisma.tripActivity.findUnique({ where: { id: tripActivityAId } });
      expect(unchanged?.position).toBe(1);
    });
  });
});
