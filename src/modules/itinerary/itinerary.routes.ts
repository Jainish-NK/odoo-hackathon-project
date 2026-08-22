import { Router } from 'express';

import { itineraryController } from './itinerary.controller';
import { reorderItinerarySchema, tripIdParamSchema } from './itinerary.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
const router = Router({ mergeParams: true });

/**
 * @openapi
 * /trips/{tripId}/itinerary:
 *   get:
 *     tags: [Itinerary]
 *     summary: Get the trip's day-wise itinerary (server-built, ready for the frontend)
 *     description: >
 *       Every calendar day between the trip's startDate and endDate is included,
 *       even days with no scheduled activities, so the client never has to
 *       reconstruct Trip → Stop → Activity relationships itself.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: "{ tripId, tripName, startDate, endDate, days: [{ dayNumber, date, activities }] }" }
 *       403: { description: The trip belongs to another user }
 *       404: { description: Trip does not exist }
 */
router.get('/', validate({ params: tripIdParamSchema }), asyncHandler(itineraryController.get));

/**
 * @openapi
 * /trips/{tripId}/itinerary/reorder:
 *   patch:
 *     tags: [Itinerary]
 *     summary: Reorder and/or move itinerary items (transactional), returns the rebuilt itinerary
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [tripActivityId, position]
 *                   properties:
 *                     tripActivityId: { type: string, format: uuid }
 *                     tripStopId: { type: string, format: uuid }
 *                     date: { type: string, format: date }
 *                     position: { type: integer, minimum: 0 }
 *     responses:
 *       200: { description: Rebuilt itinerary reflecting the new order }
 *       400: { description: One or more items do not belong to this trip }
 */
router.patch(
  '/reorder',
  validate({ params: tripIdParamSchema, body: reorderItinerarySchema }),
  asyncHandler(itineraryController.reorder),
);

export default router;
