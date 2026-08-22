import { NotFoundError } from '@/utils/errors';
import { buildPaginationMeta, parsePagination } from '@/utils/pagination';

import { activitiesRepository } from './activities.repository';
import { ListActivitiesQuery } from './activities.schema';

export const activitiesService = {
  async listActivities(query: ListActivitiesQuery) {
    const pagination = parsePagination(query);
    const { items, total } = await activitiesRepository.list(query, pagination);
    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  async getActivityById(activityId: string) {
    const activity = await activitiesRepository.findById(activityId);
    if (!activity) throw new NotFoundError('Activity');
    return activity;
  },
};
