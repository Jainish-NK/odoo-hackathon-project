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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startDate, endDate]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               coverImageUrl: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               visibility: { type: string, enum: [PRIVATE, PUBLIC], default: PRIVATE }
 *               budgetAmount: { type: number, minimum: 0 }
 *     responses:
 *       201: { description: Trip created (shareSlug is generated immediately if visibility is PUBLIC) }
 *       400: { description: endDate before startDate, or other validation error }
 *   get:
 *     tags: [Trips]
 *     summary: List the authenticated user's trips (paginated, filterable, sortable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [DRAFT, PLANNED, ONGOING, COMPLETED] } }
 *       - { in: query, name: sort, schema: { type: string, enum: [startDate, -startDate, endDate, -endDate, createdAt, -createdAt, updatedAt, -updatedAt, name, -name] } }
 *     responses:
 *       200: { description: Paginated trip summaries (name, dates, visibility, destination count, timestamps) }
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
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Full trip detail including ordered stops and cities }
 *       403: { description: The trip belongs to another user }
 *       404: { description: Trip does not exist }
 *   patch:
 *     tags: [Trips]
 *     summary: Update a trip owned by the authenticated user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Updated trip }
 *       400: { description: Validation error }
 *       403: { description: The trip belongs to another user }
 *   delete:
 *     tags: [Trips]
 *     summary: Delete a trip owned by the authenticated user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Trip deleted (stops, activities, and expenses cascade-delete) }
 *       403: { description: The trip belongs to another user }
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
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [visibility]
 *             properties: { visibility: { type: string, enum: [PRIVATE, PUBLIC] } }
 *     responses:
 *       200: { description: Updated trip; a shareSlug is generated the first time a trip goes PUBLIC and reused after }
 *       403: { description: The trip belongs to another user }
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
