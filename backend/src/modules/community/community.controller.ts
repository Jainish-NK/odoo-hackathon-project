import { Request, Response } from 'express';

import { ListCommunityTripsQuery } from './community.schema';
import { communityService } from './community.service';

import { sendSuccess } from '@/utils/response';

export const communityController = {
  async list(
    req: Request<unknown, unknown, unknown, ListCommunityTripsQuery>,
    res: Response,
  ): Promise<void> {
    const { items, meta } = await communityService.listPublicTrips(req.query);
    sendSuccess(res, items, 200, meta);
  },

  async getById(req: Request<{ tripId: string }>, res: Response): Promise<void> {
    const trip = await communityService.getPublicTrip(req.params.tripId);
    sendSuccess(res, trip);
  },

  async getByShareSlug(req: Request<{ shareSlug: string }>, res: Response): Promise<void> {
    const trip = await communityService.getPublicTripByShareSlug(req.params.shareSlug);
    sendSuccess(res, trip);
  },
};
