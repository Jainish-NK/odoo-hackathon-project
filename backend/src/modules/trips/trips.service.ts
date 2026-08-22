import crypto from 'node:crypto';

import { Trip, TripStatus, TripVisibility } from '@prisma/client';

import { tripsRepository } from './trips.repository';
import { CreateTripInput, ListTripsQuery, UpdateTripInput } from './trips.schema';

import { communityService } from '@/modules/community/community.service';
import { ForbiddenError, NotFoundError } from '@/utils/errors';
import { buildPaginationMeta, parsePagination, PaginationParams } from '@/utils/pagination';

function generateShareSlug(name: string): string {
  const slugBase = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  return `${slugBase || 'trip'}-${crypto.randomBytes(4).toString('hex')}`;
}

export const tripsService = {
  /**
   * Loads a trip and asserts the given user owns it. Shared by every module
   * that operates on a nested trip resource (stops, activities, budget,
   * itinerary, copy) so ownership logic lives in exactly one place.
   */
  async getOwnedTrip(tripId: string, userId: string): Promise<Trip> {
    const trip = await tripsRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError('You do not own this trip');
    return trip;
  },

  async createTrip(userId: string, input: CreateTripInput) {
    return tripsRepository.create(userId, {
      name: input.name,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
      startDate: input.startDate,
      endDate: input.endDate,
      visibility: input.visibility,
      shareSlug:
        input.visibility === TripVisibility.PUBLIC ? generateShareSlug(input.name) : undefined,
      budgetAmount: input.budgetAmount,
    });
  },

  async listTrips(userId: string, query: ListTripsQuery) {
    const pagination: PaginationParams = parsePagination(query);
    const { items, total } = await tripsRepository.listForUser(
      userId,
      pagination,
      query.status as TripStatus | undefined,
      query.sort,
    );
    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  async getTripDetail(tripId: string, userId: string) {
    const trip = await tripsRepository.findByIdWithDetail(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError('You do not own this trip');
    return trip;
  },

  async updateTrip(tripId: string, userId: string, input: UpdateTripInput) {
    const trip = await this.getOwnedTrip(tripId, userId);

    const data: Record<string, unknown> = { ...input };
    if (input.visibility === TripVisibility.PUBLIC && !trip.shareSlug) {
      data.shareSlug = generateShareSlug(trip.name);
    }

    const updated = await tripsRepository.update(tripId, data);
    await communityService.invalidateTripCache(tripId, updated.shareSlug);
    return updated;
  },

  /**
   * Dedicated visibility toggle, separate from the general update endpoint,
   * for clients that only want to flip public/private without resending
   * the rest of the trip. Shares the same shareSlug-generation rule as
   * updateTrip so a trip only ever gets one share link, generated once.
   */
  async setVisibility(tripId: string, userId: string, visibility: TripVisibility) {
    return this.updateTrip(tripId, userId, { visibility });
  },

  async deleteTrip(tripId: string, userId: string): Promise<void> {
    const trip = await this.getOwnedTrip(tripId, userId);
    await tripsRepository.delete(tripId);
    await communityService.invalidateTripCache(tripId, trip.shareSlug);
  },
};
