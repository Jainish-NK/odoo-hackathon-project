import { Router } from 'express';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

import { tripStopsController } from './trip-stops.controller';
import { createStopSchema, reorderStopsSchema, stopIdParamSchema, updateStopSchema } from './trip-stops.schema';
import { tripIdParamSchema } from './trips.schema';

// mergeParams: true so :tripId from the parent router (trips.routes.ts) is visible here.
const router = Router({ mergeParams: true });

router.get('/', validate({ params: tripIdParamSchema }), asyncHandler(tripStopsController.list));

router.post(
  '/',
  validate({ params: tripIdParamSchema, body: createStopSchema }),
  asyncHandler(tripStopsController.create),
);

router.patch(
  '/reorder',
  validate({ params: tripIdParamSchema, body: reorderStopsSchema }),
  asyncHandler(tripStopsController.reorder),
);

router.patch(
  '/:stopId',
  validate({ params: stopIdParamSchema, body: updateStopSchema }),
  asyncHandler(tripStopsController.update),
);

router.delete('/:stopId', validate({ params: stopIdParamSchema }), asyncHandler(tripStopsController.remove));

export default router;
