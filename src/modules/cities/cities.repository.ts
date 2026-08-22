import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PaginationParams } from '@/utils/pagination';

import { ListCitiesQuery } from './cities.schema';

export const citiesRepository = {
  async list(query: ListCitiesQuery, pagination: PaginationParams) {
    const where: Prisma.CityWhereInput = {
      ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
      ...(query.region ? { region: { equals: query.region, mode: 'insensitive' } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { country: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.city.findMany({
        where,
        orderBy: { popularity: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.city.count({ where }),
    ]);

    return { items, total };
  },

  findById(cityId: string) {
    return prisma.city.findUnique({ where: { id: cityId } });
  },
};
