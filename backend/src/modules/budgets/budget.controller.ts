import { Request, Response } from 'express';

import { budgetService } from './budget.service';

import { sendSuccess } from '@/utils/response';

export const budgetController = {
  async get(req: Request<{ tripId: string }>, res: Response): Promise<void> {
    const budget = await budgetService.getBudget(req.params.tripId, req.user!.id);
    sendSuccess(res, budget);
  },
};
