import { Router } from 'express';

import { expensesController } from './expenses.controller';
import {
  createExpenseSchema,
  expenseIdParamSchema,
  tripIdOnlyParamSchema,
  updateExpenseSchema,
} from './expenses.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
const router = Router({ mergeParams: true });

router.get('/', validate({ params: tripIdOnlyParamSchema }), asyncHandler(expensesController.list));

router.post(
  '/',
  validate({ params: tripIdOnlyParamSchema, body: createExpenseSchema }),
  asyncHandler(expensesController.create),
);

router.patch(
  '/:expenseId',
  validate({ params: expenseIdParamSchema, body: updateExpenseSchema }),
  asyncHandler(expensesController.update),
);

router.delete(
  '/:expenseId',
  validate({ params: expenseIdParamSchema }),
  asyncHandler(expensesController.remove),
);

export default router;
