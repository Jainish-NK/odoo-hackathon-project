import { Prisma, TripVisibility } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PaginationParams } from '@/utils/pagination';

const PUBLIC_OWNER_SELECT = { id: true, name: true, profilePhotoUrl: true } as const;

type TripForCopy = Prisma.TripGetPayload<{
  include: { stops: { include: { tripActivities: true } } };
}>;

export const communityRepository = {
  async listPublicTrips(pagination: PaginationParams, search?: string) {
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
    };

    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
          owner: { select: PUBLIC_OWNER_SELECT },
          _count: { select: { stops: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return { items, total };
  },

  findPublicTripDetail(tripId: string) {
    return prisma.trip.findFirst({
      where: { id: tripId, visibility: TripVisibility.PUBLIC },
      select: {
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
          orderBy: { position: 'asc' },
          include: {
            city: true,
            tripActivities: {
              orderBy: [{ date: 'asc' }, { position: 'asc' }],
              include: { activity: true },
            },
          },
        },
      },
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
