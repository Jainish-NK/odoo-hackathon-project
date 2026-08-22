import { Request, Response } from 'express';

import { sendSuccess } from '@/utils/response';

import { citiesService } from './cities.service';
import { ListCitiesQuery } from './cities.schema';

export const citiesController = {
  async list(req: Request<unknown, unknown, unknown, ListCitiesQuery>, res: Response): Promise<void> {
    const { items, meta } = await citiesService.listCities(req.query);
    sendSuccess(res, items, 200, meta);
  },

  async getById(req: Request<{ cityId: string }>, res: Response): Promise<void> {
    const city = await citiesService.getCityById(req.params.cityId);
    sendSuccess(res, city);
  },
};
