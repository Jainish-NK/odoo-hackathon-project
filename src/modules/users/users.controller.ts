import { Request, Response } from 'express';

import { sendSuccess } from '@/utils/response';

import { usersService } from './users.service';
import { SaveDestinationInput, UpdateProfileInput } from './users.schema';

export const usersController = {
  async getMe(req: Request, res: Response): Promise<void> {
    const user = await usersService.getProfile(req.user!.id);
    sendSuccess(res, user);
  },

  async updateMe(req: Request<unknown, unknown, UpdateProfileInput>, res: Response): Promise<void> {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user);
  },

  async deleteMe(req: Request, res: Response): Promise<void> {
    await usersService.deleteAccount(req.user!.id);
    sendSuccess(res, { message: 'Account deleted' });
  },

  async listSavedDestinations(req: Request, res: Response): Promise<void> {
    const cities = await usersService.listSavedDestinations(req.user!.id);
    sendSuccess(res, cities);
  },

  async saveDestination(req: Request<unknown, unknown, SaveDestinationInput>, res: Response): Promise<void> {
    const city = await usersService.saveDestination(req.user!.id, req.body.cityId);
    sendSuccess(res, city, 201);
  },

  async removeSavedDestination(req: Request<{ cityId: string }>, res: Response): Promise<void> {
    await usersService.removeSavedDestination(req.user!.id, req.params.cityId);
    sendSuccess(res, { message: 'Removed from saved destinations' });
  },
};
