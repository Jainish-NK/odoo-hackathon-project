import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';

describe('Health Check Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /health responds with status payload', async () => {
    const res = await request(app).get('/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('dependencies.database');
    expect(res.body.data).toHaveProperty('dependencies.redis');
  });

  it('GET /api/health responds with status payload', async () => {
    const res = await request(app).get('/api/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBeDefined();
  });

  it('GET /api/v1/health responds with status payload', async () => {
    const res = await request(app).get('/api/v1/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBeDefined();
  });
});
