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
 *     summary: Search/browse the activity catalog
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
 *     summary: Get a single activity by id
 */
router.get(
  '/:activityId',
  validate({ params: activityIdParamSchema }),
  asyncHandler(activitiesController.getById),
);

export default router;
