import { Router } from 'express';

import { itineraryController } from './itinerary.controller';
import { reorderItinerarySchema, tripIdParamSchema } from './itinerary.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
const router = Router({ mergeParams: true });

router.get('/', validate({ params: tripIdParamSchema }), asyncHandler(itineraryController.get));

router.patch(
  '/reorder',
  validate({ params: tripIdParamSchema, body: reorderItinerarySchema }),
  asyncHandler(itineraryController.reorder),
);

export default router;
