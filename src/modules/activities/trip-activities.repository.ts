import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const tripActivitiesRepository = {
  findStopInTrip(tripId: string, stopId: string) {
    return prisma.tripStop.findFirst({ where: { id: stopId, tripId } });
  },

  activityExists(activityId: string) {
    return prisma.activity.findUnique({ where: { id: activityId }, select: { id: true } });
  },

  findById(tripActivityId: string) {
    return prisma.tripActivity.findUnique({
      where: { id: tripActivityId },
      include: { activity: true, tripStop: true },
    });
  },

  create(data: Prisma.TripActivityUncheckedCreateInput) {
    return prisma.tripActivity.create({
      data,
      include: { activity: { include: { city: true } }, tripStop: true },
    });
  },

  update(tripActivityId: string, data: Prisma.TripActivityUpdateInput) {
    return prisma.tripActivity.update({
      where: { id: tripActivityId },
      data,
      include: { activity: { include: { city: true } }, tripStop: true },
    });
  },

  delete(tripActivityId: string) {
    return prisma.tripActivity.delete({ where: { id: tripActivityId } });
  },
};
