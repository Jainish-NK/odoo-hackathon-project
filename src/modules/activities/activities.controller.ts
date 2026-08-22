import { Request, Response } from 'express';

import { sendSuccess } from '@/utils/response';

import { activitiesService } from './activities.service';
import { ListActivitiesQuery } from './activities.schema';

export const activitiesController = {
  async list(req: Request<unknown, unknown, unknown, ListActivitiesQuery>, res: Response): Promise<void> {
    const { items, meta } = await activitiesService.listActivities(req.query);
    sendSuccess(res, items, 200, meta);
  },

  async getById(req: Request<{ activityId: string }>, res: Response): Promise<void> {
    const activity = await activitiesService.getActivityById(req.params.activityId);
    sendSuccess(res, activity);
  },
};
