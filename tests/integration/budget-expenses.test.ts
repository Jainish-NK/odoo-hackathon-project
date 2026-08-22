import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('Expenses and budget', () => {
  let app: Express;

  const emailA = `budget.a.${Date.now()}@globetrotter.dev`;
  const emailB = `budget.b.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let tripId: string;
  let stopId: string;
  let cityId: string;

  beforeAll(async () => {
    app = createApp();

    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailA, password, name: 'Budget A' }),
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailB, password, name: 'Budget B' }),
    ]);
    tokenA = resA.body.data.tokens.accessToken;
    tokenB = resB.body.data.tokens.accessToken;

    const city = await prisma.city.create({
      data: { name: `BudgetCity-${Date.now()}`, country: 'Testland' },
    });
    cityId = city.id;

    const tripRes = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Budget Trip',
        startDate: '2026-05-01',
        endDate: '2026-05-02',
        budgetAmount: 100,
      });
    tripId = tripRes.body.data.id;

    const stopRes = await request(app)
      .post(`/api/v1/trips/${tripId}/stops`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ cityId, startDate: '2026-05-01', endDate: '2026-05-02' });
    stopId = stopRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.trip.deleteMany({ where: { id: tripId } });
    await prisma.city.deleteMany({ where: { id: cityId } });
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/trips/:tripId/expenses', () => {
    it('rejects a non-positive amount', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ category: 'TRANSPORT', amount: 0, date: '2026-05-01' });
      expect(res.status).toBe(400);
    });

    it('rejects a tripStopId belonging to a different trip', async () => {
      const otherTrip = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Other Trip', startDate: '2026-06-01', endDate: '2026-06-05' });
      const otherStop = await request(app)
        .post(`/api/v1/trips/${otherTrip.body.data.id}/stops`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ cityId, startDate: '2026-06-01', endDate: '2026-06-02' });

      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          category: 'TRANSPORT',
          amount: 10,
          date: '2026-05-01',
          tripStopId: otherStop.body.data.id,
        });
      expect(res.status).toBe(404);

      await prisma.trip.deleteMany({ where: { id: otherTrip.body.data.id } });
    });

    it("prevents a non-owner from adding an expense to someone else's trip", async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ category: 'TRANSPORT', amount: 10, date: '2026-05-01' });
      expect(res.status).toBe(403);
    });

    it('creates a transport expense on day 1 (tied to the stop)', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ category: 'TRANSPORT', amount: 30, date: '2026-05-01', tripStopId: stopId });

      expect(res.status).toBe(201);
      expect(res.body.data.tripStopId).toBe(stopId);
      expect(Number(res.body.data.amount)).toBe(30);
    });

    it('creates a meals expense on day 2', async () => {
      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ category: 'MEALS', amount: 80, date: '2026-05-02' });

      expect(res.status).toBe(201);
    });
  });

  describe('PATCH and DELETE /api/v1/trips/:tripId/expenses/:expenseId', () => {
    it('updates an expense amount', async () => {
      const createRes = await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ category: 'OTHER', amount: 5, date: '2026-05-01' });

      const patchRes = await request(app)
        .patch(`/api/v1/trips/${tripId}/expenses/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ amount: 15 });

      expect(patchRes.status).toBe(200);
      expect(Number(patchRes.body.data.amount)).toBe(15);

      const delRes = await request(app)
        .delete(`/api/v1/trips/${tripId}/expenses/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(delRes.status).toBe(200);
    });

    it("prevents a non-owner from deleting another user's expense", async () => {
      const createRes = await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ category: 'OTHER', amount: 5, date: '2026-05-01' });

      const res = await request(app)
        .delete(`/api/v1/trips/${tripId}/expenses/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(403);

      await request(app)
        .delete(`/api/v1/trips/${tripId}/expenses/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`);
    });
  });

  describe('GET /api/v1/trips/:tripId/budget', () => {
    it('combines expenses and scheduled activity costs into one deterministic breakdown', async () => {
      // Add a scheduled activity costing 20 on day 1: total day1 = 30 (transport
      // expense) + 20 (activity) = 50, exactly at the 50/day fair-share budget
      // (100 budget / 2 days) — this also exercises the > vs >= boundary for
      // overBudgetDays. Day 2 = 80 (meals expense) alone, which does exceed it.
      const activity = await prisma.activity.create({
        data: { cityId, name: `Budget Activity ${Date.now()}`, category: 'SIGHTSEEING', cost: 20 },
      });

      await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ stopId, activityId: activity.id, date: '2026-05-01' });

      const res = await request(app)
        .get(`/api/v1/trips/${tripId}/budget`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalCost).toBe(130);
      expect(res.body.data.byCategory.TRANSPORT).toBe(30);
      expect(res.body.data.byCategory.ACTIVITIES).toBe(20);
      expect(res.body.data.byCategory.MEALS).toBe(80);
      expect(res.body.data.remainingBudget).toBe(-30);
      expect(res.body.data.isOverBudget).toBe(true);
      expect(res.body.data.averagePerDayBudget).toBe(50);

      const day1 = res.body.data.dailyBreakdown.find(
        (d: { date: string }) => d.date === '2026-05-01',
      );
      const day2 = res.body.data.dailyBreakdown.find(
        (d: { date: string }) => d.date === '2026-05-02',
      );
      expect(day1.total).toBe(50);
      expect(day1.byCategory.TRANSPORT).toBe(30);
      expect(day1.byCategory.ACTIVITIES).toBe(20);
      expect(day2.total).toBe(80);
      expect(day2.byCategory.MEALS).toBe(80);

      // day1 (50) is not strictly greater than the 50/day threshold, day2 (80) is.
      expect(res.body.data.overBudgetDays).toEqual(['2026-05-02']);

      await prisma.activity.deleteMany({ where: { id: activity.id } });
    });

    it("prevents a non-owner from viewing another user's trip budget", async () => {
      const res = await request(app)
        .get(`/api/v1/trips/${tripId}/budget`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(403);
    });
  });
});
