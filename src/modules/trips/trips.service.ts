import crypto from 'node:crypto';

import { Trip, TripStatus, TripVisibility } from '@prisma/client';

import { ForbiddenError, NotFoundError } from '@/utils/errors';
import { buildPaginationMeta, parsePagination, PaginationParams } from '@/utils/pagination';

import { tripsRepository } from './trips.repository';
import { CreateTripInput, ListTripsQuery, UpdateTripInput } from './trips.schema';

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
    });
  },

  async listTrips(userId: string, query: ListTripsQuery) {
    const pagination: PaginationParams = parsePagination(query);
    const { items, total } = await tripsRepository.listForUser(userId, pagination, query.status as TripStatus | undefined);
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

    return tripsRepository.update(tripId, data);
  },

  async deleteTrip(tripId: string, userId: string): Promise<void> {
    await this.getOwnedTrip(tripId, userId);
    await tripsRepository.delete(tripId);
  },
};
