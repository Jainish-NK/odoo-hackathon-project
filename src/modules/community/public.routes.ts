import { Router } from 'express';

import { communityController } from './community.controller';
import { shareSlugParamSchema } from './community.schema';

import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

/**
 * Stable, unauthenticated, read-only access to a public trip via its
 * shareSlug rather than its database id — a slug is generated with a
 * random suffix (see trips.service#generateShareSlug) precisely so a link
 * can be shared without also exposing/guessable-linking the raw trip id.
 */
const router = Router();

/**
 * @openapi
 * /public/trips/{shareSlug}:
 *   get:
 *     tags: [Community]
 *     summary: View a public trip via its stable share link (read-only, unauthenticated)
 */
router.get(
  '/trips/:shareSlug',
  validate({ params: shareSlugParamSchema }),
  asyncHandler(communityController.getByShareSlug),
);

export default router;
