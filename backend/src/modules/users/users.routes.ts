import { Router } from 'express';

import { usersController } from './users.controller';
import { cityIdParamSchema, updateProfileSchema } from './users.schema';

import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's own profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user profile (never includes the password hash) }
 *       401: { description: Missing, invalid, or expired access token }
 *   patch:
 *     tags: [Users]
 *     summary: Update the authenticated user's own profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string, nullable: true }
 *               profilePhotoUrl: { type: string, nullable: true }
 *               languagePreference: { type: string }
 *     responses:
 *       200: { description: Updated profile }
 *       400: { description: Validation error (e.g. empty payload, invalid phone) }
 *   delete:
 *     tags: [Users]
 *     summary: Permanently delete the authenticated user's account and all owned data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Account deleted; all owned trips/stops/activities/expenses cascade-deleted }
 */
router.get('/me', asyncHandler(usersController.getMe));
router.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  asyncHandler(usersController.updateMe),
);
router.delete('/me', asyncHandler(usersController.deleteMe));

/**
 * @openapi
 * /users/me/saved-destinations:
 *   get:
 *     tags: [Users]
 *     summary: List the authenticated user's saved (wishlist) cities
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of saved cities }
 * /users/me/saved-destinations/{cityId}:
 *   post:
 *     tags: [Users]
 *     summary: Save a city to the authenticated user's wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: cityId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       201: { description: City saved }
 *       404: { description: City does not exist }
 *       409: { description: City is already saved }
 *   delete:
 *     tags: [Users]
 *     summary: Remove a city from the authenticated user's wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: cityId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Removed }
 *       404: { description: City was not saved }
 */
router.get('/me/saved-destinations', asyncHandler(usersController.listSavedDestinations));
router.post(
  '/me/saved-destinations/:cityId',
  validate({ params: cityIdParamSchema }),
  asyncHandler(usersController.saveDestination),
);
router.delete(
  '/me/saved-destinations/:cityId',
  validate({ params: cityIdParamSchema }),
  asyncHandler(usersController.removeSavedDestination),
);

export default router;
