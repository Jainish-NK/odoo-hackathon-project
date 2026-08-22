import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const usersRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  updateProfile(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  deleteById(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  listSavedDestinations(userId: string) {
    return prisma.savedDestination.findMany({
      where: { userId },
      include: { city: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  findSavedDestination(userId: string, cityId: string) {
    return prisma.savedDestination.findUnique({
      where: { userId_cityId: { userId, cityId } },
    });
  },

  addSavedDestination(userId: string, cityId: string) {
    return prisma.savedDestination.create({ data: { userId, cityId }, include: { city: true } });
  },

  removeSavedDestination(userId: string, cityId: string) {
    return prisma.savedDestination.delete({
      where: { userId_cityId: { userId, cityId } },
    });
  },

  cityExists(cityId: string) {
    return prisma.city.findUnique({ where: { id: cityId }, select: { id: true } });
  },
};
