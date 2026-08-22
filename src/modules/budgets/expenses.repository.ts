import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const expensesRepository = {
  listByTrip(tripId: string) {
    return prisma.expense.findMany({ where: { tripId }, orderBy: { date: 'asc' } });
  },

  findById(expenseId: string) {
    return prisma.expense.findUnique({ where: { id: expenseId } });
  },

  create(data: Prisma.ExpenseUncheckedCreateInput) {
    return prisma.expense.create({ data });
  },

  update(expenseId: string, data: Prisma.ExpenseUpdateInput) {
    return prisma.expense.update({ where: { id: expenseId }, data });
  },

  delete(expenseId: string) {
    return prisma.expense.delete({ where: { id: expenseId } });
  },
};
