import { Router } from 'express';

import { budgetController } from './budget.controller';
import { tripIdOnlyParamSchema } from './expenses.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
const router = Router({ mergeParams: true });

/**
 * @openapi
 * /trips/{tripId}/budget:
 *   get:
 *     tags: [Budget]
 *     summary: Get the trip's calculated cost breakdown
 *     description: >
 *       Combines two independent, non-overlapping sources: manually logged
 *       Expense rows and scheduled TripActivity costs (always counted under
 *       ACTIVITIES). Includes a per-day, per-category breakdown and
 *       overBudgetDays — days whose total exceeds budgetAmount / durationDays.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: "{ totalCost, byCategory, dailyBreakdown, overBudgetDays, remainingBudget, isOverBudget, ... }" }
 *       403: { description: The trip belongs to another user }
 */
router.get('/', validate({ params: tripIdOnlyParamSchema }), asyncHandler(budgetController.get));

export default router;
