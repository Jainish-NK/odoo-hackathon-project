import { Express } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { createApp } from '@/app';
import { env } from '@/config/env';
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
  let accessToken: string;
  let refreshToken: string;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'globetrotter.dev' } } });
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

      accessToken = res.body.data.tokens.accessToken;
      refreshToken = res.body.data.tokens.refreshToken;
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

    it('never returns a plaintext password or hash in the response body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: `plain.${Date.now()}@globetrotter.dev`, password, name: 'Plain Check' });

      const serialized = JSON.stringify(res.body);
      expect(serialized).not.toContain(password);
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('rejects incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects a wrong password for a disabled account without revealing it is disabled', async () => {
      const disabledEmail = `login-disabled.${Date.now()}@globetrotter.dev`;
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: disabledEmail, password, name: 'Login Disabled User' });
      await prisma.user.update({ where: { email: disabledEmail }, data: { isActive: false } });

      const wrongPasswordRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: disabledEmail, password: 'wrong-password' });

      expect(wrongPasswordRes.status).toBe(401);
      expect(wrongPasswordRes.body.error.code).toBe('UNAUTHORIZED');

      const correctPasswordRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: disabledEmail, password });

      expect(correctPasswordRes.status).toBe(401);
      expect(correctPasswordRes.body.error.code).toBe('ACCOUNT_DISABLED');
    });

    it('rejects a login for an unknown email without leaking existence', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody-here@globetrotter.dev', password });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Protected routes (authenticate middleware)', () => {
    it('rejects a request with no Authorization header', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });

    it('rejects a malformed Authorization header', async () => {
      const res = await request(app).get('/api/v1/users/me').set('Authorization', accessToken);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
    });

    it('rejects a syntactically invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer not-a-real-token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
    });

    it('rejects an expired token', async () => {
      const expired = jwt.sign({ sub: 'someone', email, role: 'USER' }, env.JWT_ACCESS_SECRET, {
        expiresIn: -10,
      });

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${expired}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('rejects a well-formed token for a user that no longer exists', async () => {
      const ghostToken = jwt.sign(
        {
          sub: '00000000-0000-0000-0000-000000000000',
          email: 'ghost@globetrotter.dev',
          role: 'USER',
        },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' },
      );

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${ghostToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('rejects a valid token for a disabled account', async () => {
      const disabledEmail = `disabled.${Date.now()}@globetrotter.dev`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: disabledEmail, password, name: 'Disabled User' });

      await prisma.user.update({
        where: { email: disabledEmail },
        data: { isActive: false },
      });

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${regRes.body.data.tokens.accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
    });

    it('allows a successful authenticated request with a valid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(email);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('rejects a missing refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a garbage refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'not-a-real-token' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
    });

    it('exchanges a valid refresh token for a new token pair and rotates it', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(res.body.data.tokens.refreshToken).not.toBe(refreshToken);

      // the old refresh token must no longer work (rotation)
      const reuse = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
      expect(reuse.status).toBe(401);
      expect(reuse.body.error.code).toBe('TOKEN_REVOKED');

      // update to the newly issued pair for subsequent tests
      accessToken = res.body.data.tokens.accessToken;
      refreshToken = res.body.data.tokens.refreshToken;
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes the refresh token so it can no longer be used', async () => {
      const logoutRes = await request(app).post('/api/v1/auth/logout').send({ refreshToken });
      expect(logoutRes.status).toBe(200);

      const refreshAttempt = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

      expect(refreshAttempt.status).toBe(401);
      expect(refreshAttempt.body.error.code).toBe('TOKEN_REVOKED');
    });

    it('is idempotent for an already-invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'not-a-real-token' });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('always responds successfully, even for an unknown email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'unknown@globetrotter.dev' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
