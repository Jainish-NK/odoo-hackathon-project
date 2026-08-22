import { Prisma } from '@prisma/client';

import { ListActivitiesQuery } from './activities.schema';

import { prisma } from '@/lib/prisma';
import { PaginationParams } from '@/utils/pagination';

export const activitiesRepository = {
  async list(query: ListActivitiesQuery, pagination: PaginationParams) {
    const where: Prisma.ActivityWhereInput = {
      ...(query.city ? { cityId: query.city } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.duration ? { durationMinutes: { lte: query.duration } } : {}),
      ...(query.minCost !== undefined || query.maxCost !== undefined
        ? {
            cost: {
              ...(query.minCost !== undefined ? { gte: query.minCost } : {}),
              ...(query.maxCost !== undefined ? { lte: query.maxCost } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: { city: true },
      }),
      prisma.activity.count({ where }),
    ]);

    return { items, total };
  },

  findById(activityId: string) {
    return prisma.activity.findUnique({ where: { id: activityId }, include: { city: true } });
  },
};
