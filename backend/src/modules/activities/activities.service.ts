import { activitiesRepository } from './activities.repository';
import { ListActivitiesQuery } from './activities.schema';

import { redisClient } from '@/lib/redis';
import { NotFoundError } from '@/utils/errors';
import { buildPaginationMeta, parsePagination } from '@/utils/pagination';

const LIST_CACHE_TTL_SECONDS = 120;
const DETAIL_CACHE_TTL_SECONDS = 300;

export const activitiesService = {
  /**
   * Read-heavy, low-churn catalog endpoint — cached in Redis keyed by the
   * exact query so each filter/pagination combination gets its own entry,
   * same approach as citiesService.listCities.
   */
  async listActivities(query: ListActivitiesQuery) {
    const pagination = parsePagination(query);
    const cacheKey = `activities:list:${JSON.stringify({ ...query, ...pagination })}`;

    const cached = await redisClient.getJson<{ items: unknown[]; total: number }>(cacheKey);
    const { items, total } = cached ?? (await activitiesRepository.list(query, pagination));

    if (!cached) {
      await redisClient.setJson(cacheKey, { items, total }, LIST_CACHE_TTL_SECONDS);
    }

    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  async getActivityById(activityId: string) {
    const cacheKey = `activities:detail:${activityId}`;
    const cached = await redisClient.getJson(cacheKey);
    if (cached) return cached;

    const activity = await activitiesRepository.findById(activityId);
    if (!activity) throw new NotFoundError('Activity');

    await redisClient.setJson(cacheKey, activity, DETAIL_CACHE_TTL_SECONDS);
    return activity;
  },
};
