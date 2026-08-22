import { prisma } from '@/lib/prisma';
import { PaginationParams } from '@/utils/pagination';

export const adminRepository = {
  async listUsers(pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          languagePreference: true,
          createdAt: true,
          _count: { select: { trips: true } },
        },
      }),
      prisma.user.count(),
    ]);
    return { items, total };
  },

  async listTrips(pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        select: {
          id: true,
          name: true,
          status: true,
          visibility: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { stops: true, expenses: true } },
        },
      }),
      prisma.trip.count(),
    ]);
    return { items, total };
  },

  countUsers() {
    return prisma.user.count();
  },

  countTrips() {
    return prisma.trip.count();
  },

  countPublicTrips() {
    return prisma.trip.count({ where: { visibility: 'PUBLIC' } });
  },

  countTripsCreatedSince(since: Date) {
    return prisma.trip.count({ where: { createdAt: { gte: since } } });
  },

  countActiveUsersSince(since: Date) {
    return prisma.user
      .findMany({
        where: { trips: { some: { createdAt: { gte: since } } } },
        select: { id: true },
      })
      .then((rows) => rows.length);
  },

  tripsByStatus() {
    return prisma.trip.groupBy({ by: ['status'], _count: { _all: true } });
  },

  async popularCities(limit: number) {
    const grouped = await prisma.tripStop.groupBy({
      by: ['cityId'],
      _count: { _all: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: limit,
    });

    const cities = await prisma.city.findMany({
      where: { id: { in: grouped.map((g) => g.cityId) } },
      select: { id: true, name: true, country: true },
    });
    const cityMap = new Map(cities.map((c) => [c.id, c]));

    return grouped.map((g) => ({
      city: cityMap.get(g.cityId) ?? null,
      tripStopCount: g._count._all,
    }));
  },

  async popularActivities(limit: number) {
    const grouped = await prisma.tripActivity.groupBy({
      by: ['activityId'],
      _count: { _all: true },
      orderBy: { _count: { activityId: 'desc' } },
      take: limit,
    });

    const activities = await prisma.activity.findMany({
      where: { id: { in: grouped.map((g) => g.activityId) } },
      select: { id: true, name: true, category: true },
    });
    const activityMap = new Map(activities.map((a) => [a.id, a]));

    return grouped.map((g) => ({
      activity: activityMap.get(g.activityId) ?? null,
      timesBooked: g._count._all,
    }));
  },
};
