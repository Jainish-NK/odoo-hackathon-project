import { Router } from 'express';

import { usersController } from './users.controller';
import { cityIdParamSchema, updateProfileSchema } from './users.schema';

import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(usersController.getMe));
router.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  asyncHandler(usersController.updateMe),
);
router.delete('/me', asyncHandler(usersController.deleteMe));

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
