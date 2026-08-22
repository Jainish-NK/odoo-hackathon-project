import { Router } from 'express';

import { tripActivitiesController } from './trip-activities.controller';
import {
  addTripActivitySchema,
  reorderTripActivitiesSchema,
  tripActivityParamSchema,
  tripIdOnlyParamSchema,
  updateTripActivitySchema,
} from './trip-activities.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
const router = Router({ mergeParams: true });

router.post(
  '/',
  validate({ params: tripIdOnlyParamSchema, body: addTripActivitySchema }),
  asyncHandler(tripActivitiesController.add),
);

router.patch(
  '/reorder',
  validate({ params: tripIdOnlyParamSchema, body: reorderTripActivitiesSchema }),
  asyncHandler(tripActivitiesController.reorder),
);

router.patch(
  '/:activityId',
  validate({ params: tripActivityParamSchema, body: updateTripActivitySchema }),
  asyncHandler(tripActivitiesController.update),
);

router.delete(
  '/:activityId',
  validate({ params: tripActivityParamSchema }),
  asyncHandler(tripActivitiesController.remove),
);

export default router;
