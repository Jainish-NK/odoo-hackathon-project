import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 * The activity catalog is public/unauthenticated, like cities.
 */
describe('Activities', () => {
  let app: Express;

  const suffix = Date.now();
  let cityId: string;
  let activityId: string;
  const activityName = `Unique Museum Tour ${suffix}`;

  beforeAll(async () => {
    app = createApp();

    const city = await prisma.city.create({
      data: { name: `ActivityCity-${suffix}`, country: 'Testland' },
    });
    cityId = city.id;

    const activity = await prisma.activity.create({
      data: {
        cityId,
        name: activityName,
        description: 'A one-of-a-kind guided tour',
        category: 'CULTURE',
        cost: 42.5,
        durationMinutes: 90,
      },
    });
    activityId = activity.id;
  });

  afterAll(async () => {
    await prisma.activity.deleteMany({ where: { id: activityId } });
    await prisma.city.deleteMany({ where: { id: cityId } });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/activities', () => {
    it('does not require authentication', async () => {
      const res = await request(app).get('/api/v1/activities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('searches by name', async () => {
      const res = await request(app).get(
        `/api/v1/activities?search=${encodeURIComponent(activityName)}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.data.map((a: { id: string }) => a.id)).toContain(activityId);
    });

    it('filters by city', async () => {
      const res = await request(app).get(`/api/v1/activities?city=${cityId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.map((a: { id: string }) => a.id)).toContain(activityId);
    });

    it('filters by category', async () => {
      const res = await request(app).get('/api/v1/activities?category=CULTURE');
      expect(res.status).toBe(200);
      expect(res.body.data.map((a: { id: string }) => a.id)).toContain(activityId);
    });

    it('filters by cost range', async () => {
      const inRange = await request(app).get(
        `/api/v1/activities?city=${cityId}&minCost=40&maxCost=50`,
      );
      expect(inRange.body.data.map((a: { id: string }) => a.id)).toContain(activityId);

      const outOfRange = await request(app).get(
        `/api/v1/activities?city=${cityId}&minCost=100&maxCost=200`,
      );
      expect(outOfRange.body.data.map((a: { id: string }) => a.id)).not.toContain(activityId);
    });

    it('rejects an invalid category', async () => {
      const res = await request(app).get('/api/v1/activities?category=NOT_A_CATEGORY');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/activities/:activityId', () => {
    it('returns a single activity by id', async () => {
      const res = await request(app).get(`/api/v1/activities/${activityId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(activityName);
    });

    it('returns 404 for a nonexistent activity', async () => {
      const res = await request(app).get('/api/v1/activities/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });
});
