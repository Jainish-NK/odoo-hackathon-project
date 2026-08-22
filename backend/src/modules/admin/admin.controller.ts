import { Request, Response } from 'express';

import { PaginationQuery } from './admin.schema';
import { adminService } from './admin.service';

import { sendSuccess } from '@/utils/response';

export const adminController = {
  async listUsers(
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response,
  ): Promise<void> {
    const { items, meta } = await adminService.listUsers(req.query);
    sendSuccess(res, items, 200, meta);
  },

  async listTrips(
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response,
  ): Promise<void> {
    const { items, meta } = await adminService.listTrips(req.query);
    sendSuccess(res, items, 200, meta);
  },

  async getAnalytics(_req: Request, res: Response): Promise<void> {
    const analytics = await adminService.getAnalytics();
    sendSuccess(res, analytics);
  },
};
