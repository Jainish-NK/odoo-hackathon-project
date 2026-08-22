import { Role } from '@prisma/client';
import { Router } from 'express';

import { adminController } from './admin.controller';
import { paginationQuerySchema } from './admin.schema';

import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200: { description: Paginated users (id, email, name, role, languagePreference, createdAt, trip count — never the password hash) }
 *       401: { description: Missing/invalid access token }
 *       403: { description: Authenticated but not an ADMIN }
 */
router.get(
  '/users',
  validate({ query: paginationQuerySchema }),
  asyncHandler(adminController.listUsers),
);

/**
 * @openapi
 * /admin/trips:
 *   get:
 *     tags: [Admin]
 *     summary: List all trips across all users (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200: { description: Paginated trips with owner summary and stop/expense counts }
 *       403: { description: Authenticated but not an ADMIN }
 */
router.get(
  '/trips',
  validate({ query: paginationQuerySchema }),
  asyncHandler(adminController.listTrips),
);

/**
 * @openapi
 * /admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Platform-level usage analytics (admin only, Redis-cached 60s)
 *     description: >
 *       All aggregates are computed in the database (count/groupBy), never
 *       by loading full tables into application memory.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "{ totals, engagement, tripsByStatus, popularCities, popularActivities, generatedAt }" }
 *       403: { description: Authenticated but not an ADMIN }
 */
router.get('/analytics', asyncHandler(adminController.getAnalytics));

export default router;
