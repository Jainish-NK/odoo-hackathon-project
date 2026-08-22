import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('GET /api/v1/trips', () => {
  let app: Express;
  let accessToken: string;
  const email = `trips.test.${Date.now()}@globetrotter.dev`;

  beforeAll(async () => {
    app = createApp();

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123!', name: 'Trips Tester' });

    accessToken = res.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/trips');
    expect(res.status).toBe(401);
  });

  it("returns the authenticated user's trips (empty for a fresh account)", async () => {
    const res = await request(app)
      .get('/api/v1/trips')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta).toMatchObject({ page: 1, total: 0 });
  });

  it('creates a trip and then lists it', async () => {
    const createRes = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Trip', startDate: '2026-10-01', endDate: '2026-10-05' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Test Trip');

    const listRes = await request(app)
      .get('/api/v1/trips')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listRes.body.data).toHaveLength(1);
  });
});
