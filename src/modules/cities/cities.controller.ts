import { Request, Response } from 'express';

import { ListCitiesQuery } from './cities.schema';
import { citiesService } from './cities.service';

import { sendSuccess } from '@/utils/response';

export const citiesController = {
  async list(
    req: Request<unknown, unknown, unknown, ListCitiesQuery>,
    res: Response,
  ): Promise<void> {
    const { items, meta } = await citiesService.listCities(req.query);
    sendSuccess(res, items, 200, meta);
  },

  async getById(req: Request<{ cityId: string }>, res: Response): Promise<void> {
    const city = await citiesService.getCityById(req.params.cityId);
    sendSuccess(res, city);
  },
};
