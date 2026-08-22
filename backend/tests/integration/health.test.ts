import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';

describe('GET /health', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  it('responds with a status payload regardless of dependency health', async () => {
    const res = await request(app).get('/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('dependencies.database');
    expect(res.body.data).toHaveProperty('dependencies.redis');
  });
});
