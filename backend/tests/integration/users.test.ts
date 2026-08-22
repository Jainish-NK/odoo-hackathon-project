import { Express } from 'express';
import request from 'supertest';

import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

/**
 * Requires a reachable PostgreSQL + Redis (see README "Running tests").
 */
describe('Users', () => {
  let app: Express;

  const emailA = `users.a.${Date.now()}@globetrotter.dev`;
  const emailB = `users.b.${Date.now()}@globetrotter.dev`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let cityId: string;

  beforeAll(async () => {
    app = createApp();

    const [resA, resB] = await Promise.all([
      request(app).post('/api/v1/auth/register').send({ email: emailA, password, name: 'User A' }),
      request(app).post('/api/v1/auth/register').send({ email: emailB, password, name: 'User B' }),
    ]);

    tokenA = resA.body.data.tokens.accessToken;
    tokenB = resB.body.data.tokens.accessToken;

    const city = await prisma.city.create({
      data: { name: `Testville-${Date.now()}`, country: 'Testland' },
    });
    cityId = city.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await prisma.city.deleteMany({ where: { id: cityId } });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/users/me', () => {
    it('rejects an unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });

    it("returns the authenticated user's own profile without the password hash", async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(emailA);
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('lets a user update their own profile', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'User A Updated', phone: '+1 555-0100', languagePreference: 'fr' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('User A Updated');
      expect(res.body.data.phone).toBe('+1 555-0100');
      expect(res.body.data.languagePreference).toBe('fr');
    });

    it('rejects an empty update payload', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects an invalid phone number', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ phone: 'not-a-phone-number!!' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it("never lets a user's update affect another user's data", async () => {
      // updateProfileSchema has no `id`/`userId` field at all, so even a
      // client that tries to smuggle one through is ignored — the target
      // row is always derived from the authenticated token (req.user.id).
      await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Attempted Hijack', id: 'someone-elses-id', userId: 'someone-elses-id' });

      const bRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(bRes.body.data.name).toBe('User B');
      expect(bRes.body.data.email).toBe(emailB);
    });
  });

  describe('Saved destinations', () => {
    it('rejects saving a destination for a nonexistent city', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/saved-destinations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
    });

    it('saves, lists, and removes a destination for the authenticated user', async () => {
      const saveRes = await request(app)
        .post(`/api/v1/users/me/saved-destinations/${cityId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(saveRes.status).toBe(201);
      expect(saveRes.body.data.id).toBe(cityId);

      const listRes = await request(app)
        .get('/api/v1/users/me/saved-destinations')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.map((c: { id: string }) => c.id)).toContain(cityId);

      // saving the same city twice is a conflict, not silently ignored
      const dupRes = await request(app)
        .post(`/api/v1/users/me/saved-destinations/${cityId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(dupRes.status).toBe(409);

      const removeRes = await request(app)
        .delete(`/api/v1/users/me/saved-destinations/${cityId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(removeRes.status).toBe(200);

      const listAfterRes = await request(app)
        .get('/api/v1/users/me/saved-destinations')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(listAfterRes.body.data.map((c: { id: string }) => c.id)).not.toContain(cityId);
    });

    it("a user's saved destinations are scoped to them, not visible/removable by others", async () => {
      await request(app)
        .post(`/api/v1/users/me/saved-destinations/${cityId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      const bListRes = await request(app)
        .get('/api/v1/users/me/saved-destinations')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(bListRes.body.data).toHaveLength(0);

      // B has never saved this city, so removing it is a 404, not a
      // cross-user delete of A's saved destination.
      const bRemoveRes = await request(app)
        .delete(`/api/v1/users/me/saved-destinations/${cityId}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(bRemoveRes.status).toBe(404);

      const aListRes = await request(app)
        .get('/api/v1/users/me/saved-destinations')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(aListRes.body.data.map((c: { id: string }) => c.id)).toContain(cityId);
    });
  });

  describe('DELETE /api/v1/users/me', () => {
    it("deletes the authenticated user's own account and invalidates their session", async () => {
      const email = `users.delete.${Date.now()}@globetrotter.dev`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password, name: 'Delete Me' });
      const token = regRes.body.data.tokens.accessToken;

      const delRes = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(delRes.status).toBe(200);

      const afterRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(afterRes.status).toBe(401);
      expect(afterRes.body.error.code).toBe('USER_NOT_FOUND');

      const found = await prisma.user.findUnique({ where: { email } });
      expect(found).toBeNull();
    });

    it('cascades through trips, stops, activities, and expenses without leaving orphans', async () => {
      const email = `users.cascade.${Date.now()}@globetrotter.dev`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password, name: 'Cascade Tester' });
      const token = regRes.body.data.tokens.accessToken;

      const tripRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cascade Trip', startDate: '2026-09-01', endDate: '2026-09-05' });
      const tripId = tripRes.body.data.id;

      const stopRes = await request(app)
        .post(`/api/v1/trips/${tripId}/stops`)
        .set('Authorization', `Bearer ${token}`)
        .send({ cityId, startDate: '2026-09-01', endDate: '2026-09-05' });
      const stopId = stopRes.body.data.id;

      const activityRow = await prisma.activity.create({
        data: { cityId, name: `Cascade Activity ${Date.now()}`, category: 'SIGHTSEEING', cost: 10 },
      });
      const tripActivityRes = await request(app)
        .post(`/api/v1/trips/${tripId}/activities`)
        .set('Authorization', `Bearer ${token}`)
        .send({ stopId, activityId: activityRow.id, date: '2026-09-02' });

      await request(app)
        .post(`/api/v1/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({ category: 'MEALS', amount: 20, date: '2026-09-02', tripStopId: stopId });

      await request(app).delete('/api/v1/users/me').set('Authorization', `Bearer ${token}`);

      expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
      expect(await prisma.trip.findUnique({ where: { id: tripId } })).toBeNull();
      expect(await prisma.tripStop.findUnique({ where: { id: stopId } })).toBeNull();
      expect(
        await prisma.tripActivity.findUnique({ where: { id: tripActivityRes.body.data.id } }),
      ).toBeNull();
      expect(await prisma.expense.findFirst({ where: { tripId } })).toBeNull();
      // the city and catalog activity are shared reference data, not
      // owned by the user, so they must survive account deletion.
      expect(await prisma.city.findUnique({ where: { id: cityId } })).not.toBeNull();

      await prisma.activity.deleteMany({ where: { id: activityRow.id } });
    });
  });
});
