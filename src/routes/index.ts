import { Router } from 'express';

import activitiesRoutes from '@/modules/activities/activities.routes';
import adminRoutes from '@/modules/admin/admin.routes';
import authRoutes from '@/modules/auth/auth.routes';
import citiesRoutes from '@/modules/cities/cities.routes';
import communityRoutes from '@/modules/community/community.routes';
import publicRoutes from '@/modules/community/public.routes';
import tripsRoutes from '@/modules/trips/trips.routes';
import usersRoutes from '@/modules/users/users.routes';

/**
 * Central route registration. Every domain module owns its own router;
 * this file only composes them under /api/v1/<module>. Nested trip
 * resources (stops, activities, itinerary, budget, copy) are composed one
 * level down inside trips.routes.ts.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/cities', citiesRoutes);
router.use('/activities', activitiesRoutes);
router.use('/trips', tripsRoutes);
router.use('/community', communityRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

export default router;
