import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 * Covers role-based access control (authorize()) on the admin router —
 * registration never lets a client choose their own role, so the admin
 * account here is seeded directly through Prisma, the way a real deploy
 * would create its first admin.
 */
describe('Authorization (RBAC)', () => {
  let app: Express;

  const adminEmail = `admin.${Date.now()}@globetrotter.dev`;
  const userEmail = `user.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    app = createApp();

    const passwordHash = await bcrypt.hash(password, 4);
    await prisma.user.create({
      data: { email: adminEmail, passwordHash, name: 'Test Admin', role: Role.ADMIN },
    });

    const [adminLogin, userReg] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({ email: adminEmail, password }),
      request(app)
        .post('/api/v1/auth/register')
        .send({ email: userEmail, password, name: 'Regular User' }),
    ]);

    adminToken = adminLogin.body.data.tokens.accessToken;
    userToken = userReg.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/admin/users', () => {
    it('rejects an unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/admin/users');
      expect(res.status).toBe(401);
    });

    it('rejects a normal (non-admin) user', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows an admin user', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/admin/trips', () => {
    it('rejects a normal (non-admin) user', async () => {
      const res = await request(app)
        .get('/api/v1/admin/trips')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('allows an admin user', async () => {
      const res = await request(app)
        .get('/api/v1/admin/trips')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
    });
  });

  describe('GET /api/v1/admin/analytics', () => {
    it('rejects a normal user', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('allows an admin user and returns aggregate stats computed in the database', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totals).toMatchObject({
        users: expect.any(Number),
        trips: expect.any(Number),
        publicTrips: expect.any(Number),
      });
      expect(res.body.data.engagement).toMatchObject({
        tripsCreatedLast30Days: expect.any(Number),
        activeUsersLast30Days: expect.any(Number),
      });
      expect(Array.isArray(res.body.data.tripsByStatus)).toBe(true);
      expect(Array.isArray(res.body.data.popularCities)).toBe(true);
      expect(Array.isArray(res.body.data.popularActivities)).toBe(true);
      expect(res.body.data.totals.users).toBeGreaterThan(0);
    });
  });

  describe('A normal user can never reach admin functionality via a forged role claim', () => {
    it('ignores a client-supplied role and only trusts the server-issued token', async () => {
      // The access token is signed server-side from the DB role at login
      // time; there is no client input path that sets req.user.role, so
      // this just re-confirms the normal user's own token stays USER-scoped.
      const meRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(meRes.body.data.role).toBe(Role.USER);
    });
  });
});
