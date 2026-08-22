import { Router } from 'express';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

import { activitiesController } from './activities.controller';
import { activityIdParamSchema, listActivitiesQuerySchema } from './activities.schema';

const router = Router();

/**
 * @openapi
 * /activities:
 *   get:
 *     tags: [Activities]
 *     summary: Search/browse the activity catalog
 */
router.get('/', validate({ query: listActivitiesQuerySchema }), asyncHandler(activitiesController.list));

/**
 * @openapi
 * /activities/{activityId}:
 *   get:
 *     tags: [Activities]
 *     summary: Get a single activity by id
 */
router.get(
  '/:activityId',
  validate({ params: activityIdParamSchema }),
  asyncHandler(activitiesController.getById),
);

export default router;
