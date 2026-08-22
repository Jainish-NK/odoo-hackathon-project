import { Router } from 'express';

import { tripActivitiesController } from './trip-activities.controller';
import {
  addTripActivitySchema,
  reorderTripActivitiesSchema,
  tripActivityParamSchema,
  tripIdOnlyParamSchema,
  updateTripActivitySchema,
} from './trip-activities.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
const router = Router({ mergeParams: true });

/**
 * @openapi
 * /trips/{tripId}/activities:
 *   post:
 *     tags: [Trips]
 *     summary: Schedule a catalog activity onto one of the trip's stops
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stopId, activityId, date]
 *             properties:
 *               stopId: { type: string, format: uuid }
 *               activityId: { type: string, format: uuid }
 *               date: { type: string, format: date }
 *               startTime: { type: string, example: "14:30" }
 *               endTime: { type: string, example: "16:00" }
 *               position: { type: integer, minimum: 0 }
 *               notes: { type: string }
 *               costOverride: { type: number, minimum: 0 }
 *     responses:
 *       201: { description: Activity scheduled }
 *       400: { description: Activity's city doesn't match the stop's city, or date falls outside the stop's date range }
 *       404: { description: Stop or activity does not exist }
 */
router.post(
  '/',
  validate({ params: tripIdOnlyParamSchema, body: addTripActivitySchema }),
  asyncHandler(tripActivitiesController.add),
);

/**
 * @openapi
 * /trips/{tripId}/activities/reorder:
 *   patch:
 *     tags: [Trips]
 *     summary: Persist a new position order for a trip's scheduled activities (transactional)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Activities reordered }
 *       400: { description: order must include exactly the trip's current activities }
 */
router.patch(
  '/reorder',
  validate({ params: tripIdOnlyParamSchema, body: reorderTripActivitiesSchema }),
  asyncHandler(tripActivitiesController.reorder),
);

/**
 * @openapi
 * /trips/{tripId}/activities/{activityId}:
 *   patch:
 *     tags: [Trips]
 *     summary: Update a scheduled activity's stop, date, time, position, notes, or cost override
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: activityId, required: true, schema: { type: string, format: uuid }, description: The trip-activity id (not the catalog activity id) }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: New date falls outside the (possibly new) stop's date range }
 *       404: { description: Trip activity or target stop does not exist }
 *   delete:
 *     tags: [Trips]
 *     summary: Remove an activity from a trip's itinerary
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: activityId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Removed }
 *       404: { description: Trip activity does not exist on this trip }
 */
router.patch(
  '/:activityId',
  validate({ params: tripActivityParamSchema, body: updateTripActivitySchema }),
  asyncHandler(tripActivitiesController.update),
);

router.delete(
  '/:activityId',
  validate({ params: tripActivityParamSchema }),
  asyncHandler(tripActivitiesController.remove),
);

export default router;
