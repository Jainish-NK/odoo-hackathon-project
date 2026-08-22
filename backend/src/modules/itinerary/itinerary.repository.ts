import { prisma } from '@/lib/prisma';

export const itineraryRepository = {
  getTripWithItinerary(tripId: string) {
    return prisma.trip.findUnique({
      where: { id: tripId },
      include: {
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

  async getValidTripActivityIds(tripId: string): Promise<Set<string>> {
    const items = await prisma.tripActivity.findMany({
      where: { tripStop: { tripId } },
      select: { id: true },
    });
    return new Set(items.map((i) => i.id));
  },

  reorderMany(
    items: { tripActivityId: string; tripStopId?: string; date?: Date; position: number }[],
  ) {
    return prisma.$transaction(
      items.map(({ tripActivityId, tripStopId, date, position }) =>
        prisma.tripActivity.update({
          where: { id: tripActivityId },
          data: {
            position,
            ...(tripStopId ? { tripStopId } : {}),
            ...(date ? { date } : {}),
          },
        }),
      ),
    );
  },
};
