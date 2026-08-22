import { Prisma, TripStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PaginationParams } from '@/utils/pagination';

export const tripsRepository = {
  create(userId: string, data: Prisma.TripCreateWithoutOwnerInput) {
    return prisma.trip.create({
      data: { ...data, owner: { connect: { id: userId } } },
    });
  },

  findById(tripId: string) {
    return prisma.trip.findUnique({ where: { id: tripId } });
  },

  findByIdWithDetail(tripId: string) {
    return prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { position: 'asc' },
          include: { city: true },
        },
        _count: { select: { stops: true, expenses: true } },
      },
    });
  },

  findByShareSlug(shareSlug: string) {
    return prisma.trip.findUnique({
      where: { shareSlug },
      include: {
        stops: { orderBy: { position: 'asc' }, include: { city: true } },
      },
    });
  },

  async listForUser(userId: string, pagination: PaginationParams, status?: TripStatus) {
    const where: Prisma.TripWhereInput = { userId, ...(status ? { status } : {}) };
    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: { _count: { select: { stops: true } } },
      }),
      prisma.trip.count({ where }),
    ]);
    return { items, total };
  },

  update(tripId: string, data: Prisma.TripUpdateInput) {
    return prisma.trip.update({ where: { id: tripId }, data });
  },

  delete(tripId: string) {
    return prisma.trip.delete({ where: { id: tripId } });
  },
};
