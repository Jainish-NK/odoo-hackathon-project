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

/**
 * @openapi
 * /trips/{tripId}/expenses:
 *   get:
 *     tags: [Budget]
 *     summary: List a trip's logged expenses
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Expenses ordered by date }
 *   post:
 *     tags: [Budget]
 *     summary: Log an expense against a trip
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, amount, date]
 *             properties:
 *               category: { type: string, enum: [TRANSPORT, ACCOMMODATION, ACTIVITIES, MEALS, OTHER] }
 *               amount: { type: number, minimum: 0.01 }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *               tripStopId: { type: string, format: uuid, description: Optional — must belong to this trip }
 *     responses:
 *       201: { description: Expense created }
 *       400: { description: Non-positive amount or other validation error }
 *       404: { description: tripStopId does not belong to this trip }
 */
router.get('/', validate({ params: tripIdOnlyParamSchema }), asyncHandler(expensesController.list));

router.post(
  '/',
  validate({ params: tripIdOnlyParamSchema, body: createExpenseSchema }),
  asyncHandler(expensesController.create),
);

/**
 * @openapi
 * /trips/{tripId}/expenses/{expenseId}:
 *   patch:
 *     tags: [Budget]
 *     summary: Update a logged expense
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: expenseId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Expense does not exist on this trip }
 *   delete:
 *     tags: [Budget]
 *     summary: Delete a logged expense
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: expenseId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Expense does not exist on this trip }
 */
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
