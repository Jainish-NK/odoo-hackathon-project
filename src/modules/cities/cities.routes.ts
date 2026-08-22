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
 *     summary: Search/browse the city catalog (unauthenticated, Redis-cached)
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: Matches city name or country }
 *       - { in: query, name: country, schema: { type: string } }
 *       - { in: query, name: region, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200: { description: Paginated cities, ordered by popularity }
 */
router.get('/', validate({ query: listCitiesQuerySchema }), asyncHandler(citiesController.list));

/**
 * @openapi
 * /cities/{cityId}:
 *   get:
 *     tags: [Cities]
 *     summary: Get a single city by id (unauthenticated, Redis-cached)
 *     parameters:
 *       - { in: path, name: cityId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: City detail }
 *       404: { description: City does not exist }
 */
router.get(
  '/:cityId',
  validate({ params: cityIdParamSchema }),
  asyncHandler(citiesController.getById),
);

export default router;
