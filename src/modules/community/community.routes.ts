import { Router } from 'express';

import { communityController } from './community.controller';
import { listCommunityTripsQuerySchema, tripIdParamSchema } from './community.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

/**
 * @openapi
 * /community/trips:
 *   get:
 *     tags: [Community]
 *     summary: Browse public trips shared by the community
 */
router.get(
  '/trips',
  validate({ query: listCommunityTripsQuerySchema }),
  asyncHandler(communityController.list),
);

/**
 * @openapi
 * /community/trips/{tripId}:
 *   get:
 *     tags: [Community]
 *     summary: View a single public trip (read-only, no private user data)
 */
router.get(
  '/trips/:tripId',
  validate({ params: tripIdParamSchema }),
  asyncHandler(communityController.getById),
);

export default router;
