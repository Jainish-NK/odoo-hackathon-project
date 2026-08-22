import { Request, Response } from 'express';

import { AddTripActivityInput, UpdateTripActivityInput } from './trip-activities.schema';
import { tripActivitiesService } from './trip-activities.service';

import { sendSuccess } from '@/utils/response';

export const tripActivitiesController = {
  async add(
    req: Request<{ tripId: string }, unknown, AddTripActivityInput>,
    res: Response,
  ): Promise<void> {
    const tripActivity = await tripActivitiesService.addActivity(
      req.params.tripId,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, tripActivity, 201);
  },

  async update(
    req: Request<{ tripId: string; activityId: string }, unknown, UpdateTripActivityInput>,
    res: Response,
  ): Promise<void> {
    const tripActivity = await tripActivitiesService.updateActivity(
      req.params.tripId,
      req.params.activityId,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, tripActivity);
  },

  async remove(req: Request<{ tripId: string; activityId: string }>, res: Response): Promise<void> {
    await tripActivitiesService.removeActivity(
      req.params.tripId,
      req.params.activityId,
      req.user!.id,
    );
    sendSuccess(res, { message: 'Activity removed from trip' });
  },
};
