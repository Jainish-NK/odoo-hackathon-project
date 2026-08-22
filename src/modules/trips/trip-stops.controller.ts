import { Request, Response } from 'express';

import { CreateStopInput, ReorderStopsInput, UpdateStopInput } from './trip-stops.schema';
import { tripStopsService } from './trip-stops.service';

import { sendSuccess } from '@/utils/response';

export const tripStopsController = {
  async list(req: Request<{ tripId: string }>, res: Response): Promise<void> {
    const stops = await tripStopsService.listStops(req.params.tripId, req.user!.id);
    sendSuccess(res, stops);
  },

  async create(
    req: Request<{ tripId: string }, unknown, CreateStopInput>,
    res: Response,
  ): Promise<void> {
    const stop = await tripStopsService.addStop(req.params.tripId, req.user!.id, req.body);
    sendSuccess(res, stop, 201);
  },

  async update(
    req: Request<{ tripId: string; stopId: string }, unknown, UpdateStopInput>,
    res: Response,
  ): Promise<void> {
    const stop = await tripStopsService.updateStop(
      req.params.tripId,
      req.params.stopId,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, stop);
  },

  async remove(req: Request<{ tripId: string; stopId: string }>, res: Response): Promise<void> {
    await tripStopsService.deleteStop(req.params.tripId, req.params.stopId, req.user!.id);
    sendSuccess(res, { message: 'Stop deleted' });
  },

  async reorder(
    req: Request<{ tripId: string }, unknown, ReorderStopsInput>,
    res: Response,
  ): Promise<void> {
    const stops = await tripStopsService.reorderStops(req.params.tripId, req.user!.id, req.body);
    sendSuccess(res, stops);
  },
};
