import { TripVisibility } from '@prisma/client';

import { communityRepository } from './community.repository';
import { CopyTripInput, ListCommunityTripsQuery } from './community.schema';

import { redisClient } from '@/lib/redis';
import { ForbiddenError, NotFoundError } from '@/utils/errors';
import { buildPaginationMeta, parsePagination } from '@/utils/pagination';

/**
 * Public trip data is cheap to regenerate but read far more often than it
 * changes, so it's cached in Redis:
 *  - list/browse results: short TTL only (bounding staleness) — the query
 *    space (search/city/sort/page combinations) is too open-ended to
 *    invalidate precisely, so a 30s window is the deliberate trade-off.
 *  - single-trip detail (by id or shareSlug): longer TTL, but invalidated
 *    immediately by key whenever trips.service mutates that exact trip, so
 *    edits to a public trip are reflected right away without waiting out
 *    the TTL.
 */
const LIST_CACHE_TTL_SECONDS = 30;
const DETAIL_CACHE_TTL_SECONDS = 120;
const CACHE_PREFIX = 'community';

function detailCacheKey(tripId: string): string {
  return `${CACHE_PREFIX}:detail:id:${tripId}`;
}

function shareSlugCacheKey(shareSlug: string): string {
  return `${CACHE_PREFIX}:detail:slug:${shareSlug}`;
}

export const communityService = {
  async listPublicTrips(query: ListCommunityTripsQuery) {
    const pagination = parsePagination(query);
    const cacheKey = `${CACHE_PREFIX}:list:${JSON.stringify({ ...query, ...pagination })}`;

    const cached = await redisClient.getJson<{ items: unknown[]; total: number }>(cacheKey);
    const { items, total } =
      cached ??
      (await communityRepository.listPublicTrips(pagination, query.search, query.city, query.sort));

    if (!cached) {
      await redisClient.setJson(cacheKey, { items, total }, LIST_CACHE_TTL_SECONDS);
    }

    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  async getPublicTrip(tripId: string) {
    const cacheKey = detailCacheKey(tripId);
    const cached = await redisClient.getJson(cacheKey);
    if (cached) return cached;

    const trip = await communityRepository.findPublicTripDetail(tripId);
    if (!trip) throw new NotFoundError('Trip', 'This trip is not public or does not exist');

    await redisClient.setJson(cacheKey, trip, DETAIL_CACHE_TTL_SECONDS);
    return trip;
  },

  /** Read-only public access via the trip's stable share link rather than its raw id. */
  async getPublicTripByShareSlug(shareSlug: string) {
    const cacheKey = shareSlugCacheKey(shareSlug);
    const cached = await redisClient.getJson(cacheKey);
    if (cached) return cached;

    const trip = await communityRepository.findPublicTripByShareSlug(shareSlug);
    if (!trip) throw new NotFoundError('Trip', 'This trip is not public or does not exist');

    await redisClient.setJson(cacheKey, trip, DETAIL_CACHE_TTL_SECONDS);
    return trip;
  },

  /**
   * Invalidates the cached public view of a single trip. Called by
   * trips.service whenever a trip is updated, its visibility changes, or
   * it's deleted — cheap and precise since the exact key is known, unlike
   * the list cache which relies on its short TTL instead.
   */
  async invalidateTripCache(tripId: string, shareSlug?: string | null): Promise<void> {
    await redisClient.delete(detailCacheKey(tripId));
    if (shareSlug) {
      await redisClient.delete(shareSlugCacheKey(shareSlug));
    }
  },

  /**
   * Copies a trip (public, or owned by the requester) into a brand new trip
   * owned by the requester. The original trip/owner is never modified.
   */
  async copyTrip(tripId: string, requesterId: string, input: CopyTripInput) {
    const sourceTrip = await communityRepository.findTripForCopy(tripId);
    if (!sourceTrip) throw new NotFoundError('Trip');

    const canCopy =
      sourceTrip.visibility === TripVisibility.PUBLIC || sourceTrip.userId === requesterId;
    if (!canCopy) throw new ForbiddenError('This trip is private and cannot be copied');

    const name = input.name?.trim() || `${sourceTrip.name} (Copy)`;
    return communityRepository.copyTrip(sourceTrip, requesterId, name);
  },
};
