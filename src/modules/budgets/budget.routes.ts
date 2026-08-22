import { Router } from 'express';

import { budgetController } from './budget.controller';
import { tripIdOnlyParamSchema } from './expenses.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
const router = Router({ mergeParams: true });

router.get('/', validate({ params: tripIdOnlyParamSchema }), asyncHandler(budgetController.get));

export default router;
