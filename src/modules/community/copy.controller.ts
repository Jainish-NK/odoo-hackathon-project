import { Request, Response } from 'express';

import { CopyTripInput } from './community.schema';
import { communityService } from './community.service';

import { sendSuccess } from '@/utils/response';

export const copyController = {
  async copy(
    req: Request<{ tripId: string }, unknown, CopyTripInput>,
    res: Response,
  ): Promise<void> {
    const trip = await communityService.copyTrip(req.params.tripId, req.user!.id, req.body);
    sendSuccess(res, trip, 201);
  },
};
