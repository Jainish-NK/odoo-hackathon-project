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
 *     summary: Browse public trips shared by the community (unauthenticated)
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: city, schema: { type: string, format: uuid }, description: Only trips with a stop in this city }
 *       - { in: query, name: sort, schema: { type: string, enum: [newest, popular, recentlyUpdated] }, description: "popular = highest copy count (deterministic proxy, no separate counter yet)" }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200: { description: Paginated public trips with safe owner fields only (id, name, profilePhotoUrl — never email) }
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
 *     summary: View a single public trip (read-only, unauthenticated, no private user data)
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Public trip detail with stops, cities, and scheduled activities }
 *       404: { description: Trip is private or does not exist (same response either way, to avoid leaking existence) }
 */
router.get(
  '/trips/:tripId',
  validate({ params: tripIdParamSchema }),
  asyncHandler(communityController.getById),
);

export default router;
