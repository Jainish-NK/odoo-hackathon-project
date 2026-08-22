import { Request, Response } from 'express';

import { ReorderItineraryInput } from './itinerary.schema';
import { itineraryService } from './itinerary.service';

import { sendSuccess } from '@/utils/response';

export const itineraryController = {
  async get(req: Request<{ tripId: string }>, res: Response): Promise<void> {
    const itinerary = await itineraryService.getItinerary(req.params.tripId, req.user!.id);
    sendSuccess(res, itinerary);
  },

  async reorder(
    req: Request<{ tripId: string }, unknown, ReorderItineraryInput>,
    res: Response,
  ): Promise<void> {
    const itinerary = await itineraryService.reorderItinerary(
      req.params.tripId,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, itinerary);
  },
};
