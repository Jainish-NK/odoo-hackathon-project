import { Request, Response } from 'express';

import { sendSuccess } from '@/utils/response';

import { tripsService } from './trips.service';
import { CreateTripInput, ListTripsQuery, UpdateTripInput } from './trips.schema';

export const tripsController = {
  async create(req: Request<unknown, unknown, CreateTripInput>, res: Response): Promise<void> {
    const trip = await tripsService.createTrip(req.user!.id, req.body);
    sendSuccess(res, trip, 201);
  },

  async list(req: Request<unknown, unknown, unknown, ListTripsQuery>, res: Response): Promise<void> {
    const { items, meta } = await tripsService.listTrips(req.user!.id, req.query);
    sendSuccess(res, items, 200, meta);
  },

  async getById(req: Request<{ tripId: string }>, res: Response): Promise<void> {
    const trip = await tripsService.getTripDetail(req.params.tripId, req.user!.id);
    sendSuccess(res, trip);
  },

  async update(req: Request<{ tripId: string }, unknown, UpdateTripInput>, res: Response): Promise<void> {
    const trip = await tripsService.updateTrip(req.params.tripId, req.user!.id, req.body);
    sendSuccess(res, trip);
  },

  async remove(req: Request<{ tripId: string }>, res: Response): Promise<void> {
    await tripsService.deleteTrip(req.params.tripId, req.user!.id);
    sendSuccess(res, { message: 'Trip deleted' });
  },
};
