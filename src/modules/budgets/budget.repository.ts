import { prisma } from '@/lib/prisma';

export const budgetRepository = {
  getTripForBudget(tripId: string) {
    return prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, name: true, startDate: true, endDate: true, budgetAmount: true },
    });
  },

  getExpenses(tripId: string) {
    return prisma.expense.findMany({ where: { tripId } });
  },

  getActivityCosts(tripId: string) {
    return prisma.tripActivity.findMany({
      where: { tripStop: { tripId } },
      select: { date: true, costOverride: true, activity: { select: { cost: true } } },
    });
  },
};
