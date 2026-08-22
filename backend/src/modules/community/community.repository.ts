import { Prisma, TripVisibility } from '@prisma/client';

import { CommunitySort } from './community.schema';

import { prisma } from '@/lib/prisma';
import { PaginationParams } from '@/utils/pagination';

const PUBLIC_OWNER_SELECT = { id: true, name: true, profilePhotoUrl: true } as const;

const PUBLIC_TRIP_DETAIL_SELECT = {
  id: true,
  name: true,
  description: true,
  coverImageUrl: true,
  startDate: true,
  endDate: true,
  shareSlug: true,
  createdAt: true,
  owner: { select: PUBLIC_OWNER_SELECT },
  stops: {
    orderBy: { position: 'asc' as const },
    include: {
      city: true,
      tripActivities: {
        orderBy: [{ date: 'asc' as const }, { position: 'asc' as const }],
        include: { activity: true },
      },
    },
  },
} satisfies Prisma.TripSelect;

type TripForCopy = Prisma.TripGetPayload<{
  include: { stops: { include: { tripActivities: true } } };
}>;

/**
 * "Popular" has no dedicated counter yet, so it's approximated by how many
 * times a trip has been copied by others — a real, already-tracked signal
 * of community interest — via the existing self-relation on Trip. Swapping
 * in a proper view/like count later only means changing this one mapping.
 */
function toOrderBy(sort?: CommunitySort): Prisma.TripOrderByWithRelationInput {
  switch (sort) {
    case 'popular':
      return { copies: { _count: 'desc' } };
    case 'recentlyUpdated':
      return { updatedAt: 'desc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

export const communityRepository = {
  async listPublicTrips(
    pagination: PaginationParams,
    search?: string,
    cityId?: string,
    sort?: CommunitySort,
  ) {
    const where: Prisma.TripWhereInput = {
      visibility: TripVisibility.PUBLIC,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(cityId ? { stops: { some: { cityId } } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: toOrderBy(sort),
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        select: {
          id: true,
          name: true,
          description: true,
          coverImageUrl: true,
          startDate: true,
          endDate: true,
          shareSlug: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: PUBLIC_OWNER_SELECT },
          _count: { select: { stops: true, copies: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return { items, total };
  },

  findPublicTripDetail(tripId: string) {
    return prisma.trip.findFirst({
      where: { id: tripId, visibility: TripVisibility.PUBLIC },
      select: PUBLIC_TRIP_DETAIL_SELECT,
    });
  },

  findPublicTripByShareSlug(shareSlug: string) {
    return prisma.trip.findFirst({
      where: { shareSlug, visibility: TripVisibility.PUBLIC },
      select: PUBLIC_TRIP_DETAIL_SELECT,
    });
  },

  findTripForCopy(tripId: string) {
    return prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { position: 'asc' },
          include: { tripActivities: true },
        },
      },
    });
  },

  copyTrip(sourceTrip: TripForCopy, requesterId: string, name: string) {
    return prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          userId: requesterId,
          name,
          description: sourceTrip.description,
          coverImageUrl: sourceTrip.coverImageUrl,
          startDate: sourceTrip.startDate,
          endDate: sourceTrip.endDate,
          copiedFromId: sourceTrip.id,
        },
      });

      for (const stop of sourceTrip.stops) {
        const newStop = await tx.tripStop.create({
          data: {
            tripId: newTrip.id,
            cityId: stop.cityId,
            startDate: stop.startDate,
            endDate: stop.endDate,
            position: stop.position,
          },
        });

        if (stop.tripActivities.length > 0) {
          await tx.tripActivity.createMany({
            data: stop.tripActivities.map((ta) => ({
              tripStopId: newStop.id,
              activityId: ta.activityId,
              date: ta.date,
              startTime: ta.startTime,
              endTime: ta.endTime,
              position: ta.position,
              notes: ta.notes,
              costOverride: ta.costOverride,
            })),
          });
        }
      }

      return tx.trip.findUniqueOrThrow({
        where: { id: newTrip.id },
        include: { stops: { orderBy: { position: 'asc' }, include: { city: true } } },
      });
    });
  },
};
