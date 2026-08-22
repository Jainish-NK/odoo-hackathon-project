import { Router } from 'express';

import { copyTripSchema, tripIdParamSchema } from './community.schema';
import { copyController } from './copy.controller';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
// Authentication is already enforced by trips.routes.ts (router.use(authenticate) runs first).
const router = Router({ mergeParams: true });

router.post(
  '/',
  validate({ params: tripIdParamSchema, body: copyTripSchema }),
  asyncHandler(copyController.copy),
);

export default router;
