import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 * Cities are a public, unauthenticated catalog.
 */
describe('Cities', () => {
  let app: Express;

  const suffix = Date.now();
  const cityName = `Uniqueville-${suffix}`;
  let cityId: string;

  beforeAll(async () => {
    app = createApp();

    const city = await prisma.city.create({
      data: {
        name: cityName,
        country: 'Neverland',
        region: 'Testregion',
        popularity: 42,
      },
    });
    cityId = city.id;
  });

  afterAll(async () => {
    await prisma.city.deleteMany({ where: { id: cityId } });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/cities', () => {
    it('does not require authentication', async () => {
      const res = await request(app).get('/api/v1/cities');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('searches by city name', async () => {
      const res = await request(app).get(`/api/v1/cities?search=${encodeURIComponent(cityName)}`);
      expect(res.status).toBe(200);
      expect(res.body.data.map((c: { id: string }) => c.id)).toContain(cityId);
    });

    it('filters by country', async () => {
      const res = await request(app).get('/api/v1/cities?country=Neverland');
      expect(res.status).toBe(200);
      expect(res.body.data.map((c: { id: string }) => c.id)).toContain(cityId);
      for (const c of res.body.data) {
        expect(c.country.toLowerCase()).toBe('neverland');
      }
    });

    it('filters by region', async () => {
      const res = await request(app).get('/api/v1/cities?region=Testregion');
      expect(res.status).toBe(200);
      expect(res.body.data.map((c: { id: string }) => c.id)).toContain(cityId);
    });

    it('returns an empty page for a search with no matches', async () => {
      const res = await request(app).get(`/api/v1/cities?search=NoSuchPlace-${suffix}-zzz`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/v1/cities/:cityId', () => {
    it('returns a single city by id', async () => {
      const res = await request(app).get(`/api/v1/cities/${cityId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(cityName);
    });

    it('returns 404 for a nonexistent city', async () => {
      const res = await request(app).get('/api/v1/cities/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });
});
