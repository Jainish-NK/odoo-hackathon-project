import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('Trip activities', () => {
  let app: Express;

  const emailA = `tripact.a.${Date.now()}@globetrotter.dev`;
  const emailB = `tripact.b.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let tripId: string;
  let stopId: string;
  let cityId: string;
  let otherCityId: string;
  let activityId: string;
  let otherCityActivityId: string;

  beforeAll(async () => {
    app = createApp();

    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailA, password, name: 'TripAct A' }),
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailB, password, name: 'TripAct B' }),
    ]);
    tokenA = resA.body.data.tokens.accessToken;
    tokenB = resB.body.data.tokens.accessToken;

    const suffix = Date.now();
    const [city, otherCity] = await Promise.all([
      prisma.city.create({ data: { name: `TACity-${suffix}`, country: 'Testland' } }),
      prisma.city.create({ data: { name: `TAOtherCity-${suffix}`, country: 'Testland' } }),
    ]);
    cityId = city.id;
    otherCityId = otherCity.id;

    const [activity, otherCityActivity] = await Promise.all([
      prisma.activity.create({
        data: { cityId, name: `TA Activity ${suffix}`, category: 'SIGHTSEEING', cost: 10 },
      }),
      prisma.activity.create({
        data: {
          cityId: otherCityId,
          name: `TA Other City Activity ${suffix}`,
          category: 'SIGHTSEEING',
          cost: 10,
        },
      }),
    ]);
    activityId = activity.id;
    otherCityActivityId = otherCityActivity.id;

    const tripRes = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Activity Trip', startDate: '2026-07-01', endDate: '2026-07-20' });
    tripId = tripRes.body.data.id;

    const stopRes = await request(app)
      .post(`/api/v1/trips/${tripId}/stops`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ cityId, startDate: '2026-07-01', endDate: '2026-07-10' });
    stopId = stopRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.trip.deleteMany({ where: { id: tripId } });
    await prisma.activity.deleteMany({ where: { id: { in: [activityId, otherCityActivityId] } } });
    await prisma.city.deleteMany({ where: { id: { in: [cityId, otherCityId] } } });
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/trips/:tripId/activities', () => {
    it('adds an activity to a stop within its date range', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ stopId, activityId, date: '2026-07-02' });

      expect(res.status).toBe(201);
      expect(res.body.data.activity.id).toBe(activityId);
    });

    it('rejects a nonexistent activity', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          stopId,
          activityId: '00000000-0000-0000-0000-000000000000',
          date: '2026-07-03',
        });

      expect(res.status).toBe(404);
    });

    it('rejects a nonexistent stop', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          stopId: '00000000-0000-0000-0000-000000000000',
          activityId,
          date: '2026-07-03',
        });

      expect(res.status).toBe(404);
    });

    it("rejects an activity that belongs to a different stop's city", async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ stopId, activityId: otherCityActivityId, date: '2026-07-03' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it("rejects a date outside the stop's date range", async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ stopId, activityId, date: '2026-07-15' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it("prevents a non-owner from adding an activity to someone else's trip", async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ stopId, activityId, date: '2026-07-02' });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/trips/:tripId/activities/reorder', () => {
    it('persists a new activity order via a transaction', async () => {
      const secondRes = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ stopId, activityId, date: '2026-07-04', position: 1 });

      const listRes = await request(app)
        .get(`/api/v1/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${tokenA}`);
      const firstDay = listRes.body.data.days.find(
        (d: { date: string }) => d.date === '2026-07-02',
      );
      const existingId = firstDay.activities[0].id;
      const secondId = secondRes.body.data.id;

      const reorderRes = await request(app)
        .patch(`/api/v1/trips/${tripId}/activities/reorder`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          order: [
            { tripActivityId: existingId, position: 5 },
            { tripActivityId: secondId, position: 0 },
          ],
        });

      expect(reorderRes.status).toBe(200);

      const updated = await prisma.tripActivity.findUnique({ where: { id: existingId } });
      expect(updated?.position).toBe(5);
    });

    it('rejects a reorder payload with an id from another trip', async () => {
      const res = await request(app)
        .patch(`/api/v1/trips/${tripId}/activities/reorder`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ order: [{ tripActivityId: '00000000-0000-0000-0000-000000000000', position: 0 }] });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/v1/trips/:tripId/activities/:tripActivityId', () => {
    it('removes an activity from the trip', async () => {
      const addRes = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ stopId, activityId, date: '2026-07-05' });

      const delRes = await request(app)
        .delete(`/api/v1/trips/${tripId}/activities/${addRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(delRes.status).toBe(200);

      const found = await prisma.tripActivity.findUnique({ where: { id: addRes.body.data.id } });
      expect(found).toBeNull();
    });

    it("prevents a non-owner from removing another user's trip activity", async () => {
      const addRes = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ stopId, activityId, date: '2026-07-06' });

      const res = await request(app)
        .delete(`/api/v1/trips/${tripId}/activities/${addRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(403);
    });
  });
});
