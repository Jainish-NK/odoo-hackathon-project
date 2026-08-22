import { TripVisibility } from '@prisma/client';

import { communityRepository } from './community.repository';
import { CopyTripInput, ListCommunityTripsQuery } from './community.schema';

import { ForbiddenError, NotFoundError } from '@/utils/errors';
import { buildPaginationMeta, parsePagination } from '@/utils/pagination';

export const communityService = {
  async listPublicTrips(query: ListCommunityTripsQuery) {
    const pagination = parsePagination(query);
    const { items, total } = await communityRepository.listPublicTrips(pagination, query.search);
    return { items, meta: buildPaginationMeta(pagination, total) };
  },

  async getPublicTrip(tripId: string) {
    const trip = await communityRepository.findPublicTripDetail(tripId);
    if (!trip) throw new NotFoundError('Trip', 'This trip is not public or does not exist');
    return trip;
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
