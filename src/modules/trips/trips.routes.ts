import { Router } from 'express';

import tripActivitiesRoutes from '../activities/trip-activities.routes';
import budgetRoutes from '../budgets/budget.routes';
import expensesRoutes from '../budgets/expenses.routes';
import copyRoutes from '../community/copy.routes';
import itineraryRoutes from '../itinerary/itinerary.routes';

import tripStopsRoutes from './trip-stops.routes';
import { tripsController } from './trips.controller';
import {
  createTripSchema,
  listTripsQuerySchema,
  tripIdParamSchema,
  updateTripSchema,
  updateVisibilitySchema,
} from './trips.schema';

import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /trips:
 *   post:
 *     tags: [Trips]
 *     summary: Create a new trip owned by the authenticated user
 *     security: [{ bearerAuth: [] }]
 *   get:
 *     tags: [Trips]
 *     summary: List the authenticated user's trips (paginated, optional status filter)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', validate({ body: createTripSchema }), asyncHandler(tripsController.create));
router.get('/', validate({ query: listTripsQuerySchema }), asyncHandler(tripsController.list));

/**
 * @openapi
 * /trips/{tripId}:
 *   get:
 *     tags: [Trips]
 *     summary: Get a single trip (with stops) owned by the authenticated user
 *     security: [{ bearerAuth: [] }]
 *   patch:
 *     tags: [Trips]
 *     summary: Update a trip owned by the authenticated user
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     tags: [Trips]
 *     summary: Delete a trip owned by the authenticated user
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/:tripId',
  validate({ params: tripIdParamSchema }),
  asyncHandler(tripsController.getById),
);
router.patch(
  '/:tripId',
  validate({ params: tripIdParamSchema, body: updateTripSchema }),
  asyncHandler(tripsController.update),
);
router.delete(
  '/:tripId',
  validate({ params: tripIdParamSchema }),
  asyncHandler(tripsController.remove),
);

/**
 * @openapi
 * /trips/{tripId}/visibility:
 *   patch:
 *     tags: [Trips]
 *     summary: Toggle a trip's visibility (PRIVATE/PUBLIC) without resending the rest of the trip
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/:tripId/visibility',
  validate({ params: tripIdParamSchema, body: updateVisibilitySchema }),
  asyncHandler(tripsController.updateVisibility),
);

// Nested resource trees composed from their own modules, keeping this file
// as the composition root for everything hanging off /trips/:tripId/*.
router.use('/:tripId/stops', tripStopsRoutes);
router.use('/:tripId/activities', tripActivitiesRoutes);
router.use('/:tripId/itinerary', itineraryRoutes);
router.use('/:tripId/expenses', expensesRoutes);
router.use('/:tripId/budget', budgetRoutes);
router.use('/:tripId/copy', copyRoutes);

export default router;
