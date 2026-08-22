import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 * Run `docker compose up -d postgres redis` and apply migrations against
 * .env.test's DATABASE_URL before running this suite.
 */
describe('Auth', () => {
  let app: Express;
  const email = `test.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('creates a new account and returns tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password, name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('rejects a duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password, name: 'Test User' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: '123', name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('rejects incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
