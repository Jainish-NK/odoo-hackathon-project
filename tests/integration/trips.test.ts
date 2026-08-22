import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('Trips', () => {
  let app: Express;

  const emailA = `trips.a.${Date.now()}@globetrotter.dev`;
  const emailB = `trips.b.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    app = createApp();

    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailA, password, name: 'Trips A' }),
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: emailB, password, name: 'Trips B' }),
    ]);

    tokenA = resA.body.data.tokens.accessToken;
    tokenB = resB.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/trips', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .send({ name: 'Nope', startDate: '2026-10-01', endDate: '2026-10-05' });
      expect(res.status).toBe(401);
    });

    it('creates a trip owned by the authenticated user', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Test Trip',
          description: 'A short getaway',
          startDate: '2026-10-01',
          endDate: '2026-10-05',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test Trip');
      expect(res.body.data.visibility).toBe('PRIVATE');
      expect(res.body.data.shareSlug).toBeNull();
    });

    it('rejects an end date before the start date', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Backwards Trip', startDate: '2026-10-05', endDate: '2026-10-01' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('generates a shareSlug immediately when created as PUBLIC', async () => {
      const res = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Public Trip',
          startDate: '2026-11-01',
          endDate: '2026-11-05',
          visibility: 'PUBLIC',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.visibility).toBe('PUBLIC');
      expect(res.body.data.shareSlug).toEqual(expect.any(String));
    });
  });

  describe('GET /api/v1/trips', () => {
    it("returns only the authenticated user's trips, paginated", async () => {
      const res = await request(app).get('/api/v1/trips').set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toMatchObject({ page: 1 });

      // summary fields for list views
      const trip = res.body.data[0];
      expect(trip).toHaveProperty('name');
      expect(trip).toHaveProperty('startDate');
      expect(trip).toHaveProperty('endDate');
      expect(trip).toHaveProperty('visibility');
      expect(trip).toHaveProperty('createdAt');
      expect(trip).toHaveProperty('updatedAt');
      expect(trip._count).toHaveProperty('stops');
    });

    it("does not leak another user's trips", async () => {
      const res = await request(app).get('/api/v1/trips').set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('filters by status', async () => {
      const res = await request(app)
        .get('/api/v1/trips?status=DRAFT')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      for (const trip of res.body.data) {
        expect(trip.status).toBe('DRAFT');
      }
    });

    it('sorts by name ascending when requested', async () => {
      const res = await request(app)
        .get('/api/v1/trips?sort=name')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      const names = res.body.data.map((t: { name: string }) => t.name);
      expect(names).toEqual([...names].sort());
    });

    it('rejects an invalid sort value', async () => {
      const res = await request(app)
        .get('/api/v1/trips?sort=notarealfield')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/trips/:tripId', () => {
    it('returns trip detail with stops for the owner', async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Detail Trip', startDate: '2026-12-01', endDate: '2026-12-05' });

      const res = await request(app)
        .get(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Detail Trip');
      expect(Array.isArray(res.body.data.stops)).toBe(true);
    });

    it('returns 404 for a nonexistent trip', async () => {
      const res = await request(app)
        .get('/api/v1/trips/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
    });

    it("returns 403 when a different user requests someone else's trip", async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Owned By A', startDate: '2026-12-01', endDate: '2026-12-05' });

      const res = await request(app)
        .get(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /api/v1/trips/:tripId', () => {
    it('lets the owner update their trip', async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Editable Trip', startDate: '2026-12-01', endDate: '2026-12-05' });

      const res = await request(app)
        .patch(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Renamed Trip', visibility: 'PUBLIC' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Renamed Trip');
      expect(res.body.data.visibility).toBe('PUBLIC');
      expect(res.body.data.shareSlug).toEqual(expect.any(String));
    });

    it('rejects an end date before start date on update', async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Update Dates Trip', startDate: '2026-12-01', endDate: '2026-12-05' });

      const res = await request(app)
        .patch(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ startDate: '2026-12-10', endDate: '2026-12-01' });

      expect(res.status).toBe(400);
    });

    it("prevents a user from updating another user's trip", async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Protected Trip', startDate: '2026-12-01', endDate: '2026-12-05' });

      const res = await request(app)
        .patch(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hijacked Name' });

      expect(res.status).toBe(403);

      const check = await prisma.trip.findUnique({ where: { id: createRes.body.data.id } });
      expect(check?.name).toBe('Protected Trip');
    });
  });

  describe('DELETE /api/v1/trips/:tripId', () => {
    it('lets the owner delete their trip', async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Deletable Trip', startDate: '2026-12-01', endDate: '2026-12-05' });

      const delRes = await request(app)
        .delete(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(delRes.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(getRes.status).toBe(404);
    });

    it("prevents a user from deleting another user's trip", async () => {
      const createRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Undeletable By B', startDate: '2026-12-01', endDate: '2026-12-05' });

      const res = await request(app)
        .delete(`/api/v1/trips/${createRes.body.data.id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(403);

      const check = await prisma.trip.findUnique({ where: { id: createRes.body.data.id } });
      expect(check).not.toBeNull();
    });
  });
});
