import { Router } from 'express';

import { tripStopsController } from './trip-stops.controller';
import {
  createStopSchema,
  reorderStopsSchema,
  stopIdParamSchema,
  updateStopSchema,
} from './trip-stops.schema';
import { tripIdParamSchema } from './trips.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from the parent router (trips.routes.ts) is visible here.
const router = Router({ mergeParams: true });

/**
 * @openapi
 * /trips/{tripId}/stops:
 *   get:
 *     tags: [Trips]
 *     summary: List a trip's stops, ordered by position
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Ordered array of stops, each with its city }
 *       403: { description: The trip belongs to another user }
 *   post:
 *     tags: [Trips]
 *     summary: Add a stop (a city leg) to a trip
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cityId, startDate, endDate]
 *             properties:
 *               cityId: { type: string, format: uuid }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               position: { type: integer, minimum: 0 }
 *     responses:
 *       201: { description: Stop created }
 *       400: { description: Invalid dates, or stop dates fall outside the trip's date range }
 *       404: { description: City does not exist }
 */
router.get('/', validate({ params: tripIdParamSchema }), asyncHandler(tripStopsController.list));

router.post(
  '/',
  validate({ params: tripIdParamSchema, body: createStopSchema }),
  asyncHandler(tripStopsController.create),
);

/**
 * @openapi
 * /trips/{tripId}/stops/reorder:
 *   patch:
 *     tags: [Trips]
 *     summary: Persist a new stop order (transactional — all-or-nothing)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [stopId, position]
 *                   properties:
 *                     stopId: { type: string, format: uuid }
 *                     position: { type: integer, minimum: 0 }
 *     responses:
 *       200: { description: Stops reordered }
 *       400: { description: order must include exactly the trip's current stops }
 */
router.patch(
  '/reorder',
  validate({ params: tripIdParamSchema, body: reorderStopsSchema }),
  asyncHandler(tripStopsController.reorder),
);

/**
 * @openapi
 * /trips/{tripId}/stops/{stopId}:
 *   patch:
 *     tags: [Trips]
 *     summary: Update a stop's city, dates, or position
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: stopId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Stop updated }
 *       400: { description: Invalid dates, or dates fall outside the trip's date range }
 *       404: { description: Stop or city does not exist }
 *   delete:
 *     tags: [Trips]
 *     summary: Remove a stop from a trip
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: stopId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Stop deleted }
 *       404: { description: Stop does not exist on this trip }
 */
router.patch(
  '/:stopId',
  validate({ params: stopIdParamSchema, body: updateStopSchema }),
  asyncHandler(tripStopsController.update),
);

router.delete(
  '/:stopId',
  validate({ params: stopIdParamSchema }),
  asyncHandler(tripStopsController.remove),
);

export default router;
