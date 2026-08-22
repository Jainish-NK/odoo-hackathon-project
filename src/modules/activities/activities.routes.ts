import { Router } from 'express';

import { activitiesController } from './activities.controller';
import { activityIdParamSchema, listActivitiesQuerySchema } from './activities.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

/**
 * @openapi
 * /activities:
 *   get:
 *     tags: [Activities]
 *     summary: Search/browse the activity catalog (unauthenticated, Redis-cached)
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: Matches activity name or description }
 *       - { in: query, name: city, schema: { type: string, format: uuid } }
 *       - { in: query, name: category, schema: { type: string, enum: [SIGHTSEEING, ADVENTURE, FOOD_AND_DRINK, CULTURE, NIGHTLIFE, SHOPPING, RELAXATION, OUTDOOR, OTHER] } }
 *       - { in: query, name: minCost, schema: { type: number, minimum: 0 } }
 *       - { in: query, name: maxCost, schema: { type: number, minimum: 0 } }
 *       - { in: query, name: duration, schema: { type: integer }, description: Maximum duration in minutes }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200: { description: Paginated activities, each including its city }
 */
router.get(
  '/',
  validate({ query: listActivitiesQuerySchema }),
  asyncHandler(activitiesController.list),
);

/**
 * @openapi
 * /activities/{activityId}:
 *   get:
 *     tags: [Activities]
 *     summary: Get a single activity by id (unauthenticated, Redis-cached)
 *     parameters:
 *       - { in: path, name: activityId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Activity detail }
 *       404: { description: Activity does not exist }
 */
router.get(
  '/:activityId',
  validate({ params: activityIdParamSchema }),
  asyncHandler(activitiesController.getById),
);

export default router;
