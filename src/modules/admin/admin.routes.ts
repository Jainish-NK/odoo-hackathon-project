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
 *     summary: List all trips (admin only)
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
 *     summary: Platform-level usage analytics (admin only)
 */
router.get('/analytics', asyncHandler(adminController.getAnalytics));

export default router;
