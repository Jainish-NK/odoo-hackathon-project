import { Router } from 'express';

import { copyTripSchema, tripIdParamSchema } from './community.schema';
import { copyController } from './copy.controller';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

// mergeParams: true so :tripId from trips.routes.ts is visible here.
// Authentication is already enforced by trips.routes.ts (router.use(authenticate) runs first).
const router = Router({ mergeParams: true });

/**
 * @openapi
 * /trips/{tripId}/copy:
 *   post:
 *     tags: [Community]
 *     summary: Copy a trip (must be public, or owned by the requester) into a new trip owned by the caller
 *     description: >
 *       Runs in a single database transaction: the trip, its stops, and their
 *       scheduled activities are copied. The new trip is always PRIVATE and
 *       fully independent — editing it never affects the original.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: tripId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: Optional override; defaults to "<original name> (Copy)" }
 *     responses:
 *       201: { description: New trip created, with its own id, stops, and activities }
 *       403: { description: Source trip is private and not owned by the requester }
 *       404: { description: Source trip does not exist }
 */
router.post(
  '/',
  validate({ params: tripIdParamSchema, body: copyTripSchema }),
  asyncHandler(copyController.copy),
);

export default router;
