import { redisClient } from '@/lib/redis';
import { NotFoundError } from '@/utils/errors';
import { buildPaginationMeta, parsePagination } from '@/utils/pagination';

import { citiesRepository } from './cities.repository';
import { ListCitiesQuery } from './cities.schema';

const LIST_CACHE_TTL_SECONDS = 120;
const DETAIL_CACHE_TTL_SECONDS = 300;

export const citiesService = {
  /**
   * Read-heavy, low-churn endpoint — cached in Redis keyed by the exact
   * query so pagination/filters each get their own cache entry.
   */
  async listCities(query: ListCitiesQuery) {
    const pagination = parsePagination(query);
    const cacheKey = `cities:list:${JSON.stringify({ ...query, ...pagination })}`;

    const cached = await redisClient.getJson<{ items: unknown[]; total: number }>(cacheKey);
    const { items, total } = cached ?? (await citiesRepository.list(query, pagination));

    if (!cached) {
      await redisClient.setJson(cacheKey, { items, total }, LIST_CACHE_TTL_SECONDS);
    }

    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  async getCityById(cityId: string) {
    const cacheKey = `cities:detail:${cityId}`;
    const cached = await redisClient.getJson(cacheKey);
    if (cached) return cached;

    const city = await citiesRepository.findById(cityId);
    if (!city) throw new NotFoundError('City');

    await redisClient.setJson(cacheKey, city, DETAIL_CACHE_TTL_SECONDS);
    return city;
  },
};
