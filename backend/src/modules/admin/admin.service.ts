import { adminRepository } from './admin.repository';
import { PaginationQuery } from './admin.schema';

import { redisClient } from '@/lib/redis';
import { buildPaginationMeta, parsePagination } from '@/utils/pagination';

const ANALYTICS_CACHE_KEY = 'admin:analytics';
const ANALYTICS_CACHE_TTL_SECONDS = 60;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const POPULAR_LIMIT = 10;

export const adminService = {
  async listUsers(query: PaginationQuery) {
    const pagination = parsePagination(query);
    const { items, total } = await adminRepository.listUsers(pagination);
    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  async listTrips(query: PaginationQuery) {
    const pagination = parsePagination(query);
    const { items, total } = await adminRepository.listTrips(pagination);
    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  /**
   * Platform-level analytics. Cached briefly since these aggregate queries
   * scan large tables and don't need to be real-time.
   */
  async getAnalytics() {
    const cached = await redisClient.getJson(ANALYTICS_CACHE_KEY);
    if (cached) return cached;

    const since = new Date(Date.now() - THIRTY_DAYS_MS);

    const [
      totalUsers,
      totalTrips,
      publicTrips,
      tripsLast30Days,
      activeUsersLast30Days,
      tripsByStatus,
      popularCities,
      popularActivities,
    ] = await Promise.all([
      adminRepository.countUsers(),
      adminRepository.countTrips(),
      adminRepository.countPublicTrips(),
      adminRepository.countTripsCreatedSince(since),
      adminRepository.countActiveUsersSince(since),
      adminRepository.tripsByStatus(),
      adminRepository.popularCities(POPULAR_LIMIT),
      adminRepository.popularActivities(POPULAR_LIMIT),
    ]);

    const analytics = {
      totals: {
        users: totalUsers,
        trips: totalTrips,
        publicTrips: publicTrips,
      },
      engagement: {
        tripsCreatedLast30Days: tripsLast30Days,
        activeUsersLast30Days: activeUsersLast30Days,
      },
      tripsByStatus: tripsByStatus.map((row) => ({ status: row.status, count: row._count._all })),
      popularCities,
      popularActivities,
      generatedAt: new Date().toISOString(),
    };

    await redisClient.setJson(ANALYTICS_CACHE_KEY, analytics, ANALYTICS_CACHE_TTL_SECONDS);
    return analytics;
  },
};
