import { Prisma, TripStop } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const tripStopsRepository = {
  findById(stopId: string) {
    return prisma.tripStop.findUnique({ where: { id: stopId } });
  },

  listByTrip(tripId: string) {
    return prisma.tripStop.findMany({
      where: { tripId },
      orderBy: { position: 'asc' },
      include: { city: true },
    });
  },

  async nextPosition(tripId: string): Promise<number> {
    const last = await prisma.tripStop.findFirst({
      where: { tripId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return last ? last.position + 1 : 0;
  },

  create(data: Prisma.TripStopUncheckedCreateInput) {
    return prisma.tripStop.create({ data, include: { city: true } });
  },

  update(stopId: string, data: Prisma.TripStopUpdateInput) {
    return prisma.tripStop.update({ where: { id: stopId }, data, include: { city: true } });
  },

  delete(stopId: string) {
    return prisma.tripStop.delete({ where: { id: stopId } });
  },

  async reorder(
    tripId: string,
    order: { stopId: string; position: number }[],
  ): Promise<TripStop[]> {
    return prisma.$transaction(
      order.map(({ stopId, position }) =>
        prisma.tripStop.update({
          where: { id: stopId, tripId },
          data: { position },
        }),
      ),
    );
  },

  cityExists(cityId: string) {
    return prisma.city.findUnique({ where: { id: cityId }, select: { id: true } });
  },
};
