import { Router } from 'express';

import { citiesController } from './cities.controller';
import { cityIdParamSchema, listCitiesQuerySchema } from './cities.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

/**
 * @openapi
 * /cities:
 *   get:
 *     tags: [Cities]
 *     summary: Search/browse the city catalog
 */
router.get('/', validate({ query: listCitiesQuerySchema }), asyncHandler(citiesController.list));

/**
 * @openapi
 * /cities/{cityId}:
 *   get:
 *     tags: [Cities]
 *     summary: Get a single city by id
 */
router.get(
  '/:cityId',
  validate({ params: cityIdParamSchema }),
  asyncHandler(citiesController.getById),
);

export default router;
