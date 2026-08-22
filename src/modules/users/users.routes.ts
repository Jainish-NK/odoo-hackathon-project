import { Router } from 'express';

import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

import { usersController } from './users.controller';
import { cityIdParamSchema, saveDestinationSchema, updateProfileSchema } from './users.schema';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(usersController.getMe));
router.patch('/me', validate({ body: updateProfileSchema }), asyncHandler(usersController.updateMe));
router.delete('/me', asyncHandler(usersController.deleteMe));

router.get('/me/saved-destinations', asyncHandler(usersController.listSavedDestinations));
router.post(
  '/me/saved-destinations',
  validate({ body: saveDestinationSchema }),
  asyncHandler(usersController.saveDestination),
);
router.delete(
  '/me/saved-destinations/:cityId',
  validate({ params: cityIdParamSchema }),
  asyncHandler(usersController.removeSavedDestination),
);

export default router;
