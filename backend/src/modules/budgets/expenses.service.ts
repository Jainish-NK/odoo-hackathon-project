import { expensesRepository } from './expenses.repository';
import { CreateExpenseInput, UpdateExpenseInput } from './expenses.schema';

import { tripsService } from '@/modules/trips/trips.service';
import { NotFoundError } from '@/utils/errors';

async function assertExpenseBelongsToTrip(tripId: string, expenseId: string) {
  const expense = await expensesRepository.findById(expenseId);
  if (!expense || expense.tripId !== tripId) throw new NotFoundError('Expense');
  return expense;
}

async function assertStopBelongsToTrip(tripId: string, stopId: string): Promise<void> {
  const stop = await expensesRepository.findStopInTrip(tripId, stopId);
  if (!stop) throw new NotFoundError('Trip stop');
}

export const expensesService = {
  async listExpenses(tripId: string, userId: string) {
    await tripsService.getOwnedTrip(tripId, userId);
    return expensesRepository.listByTrip(tripId);
  },

  async addExpense(tripId: string, userId: string, input: CreateExpenseInput) {
    await tripsService.getOwnedTrip(tripId, userId);
    if (input.tripStopId) {
      await assertStopBelongsToTrip(tripId, input.tripStopId);
    }
    return expensesRepository.create({ tripId, ...input });
  },

  async updateExpense(
    tripId: string,
    expenseId: string,
    userId: string,
    input: UpdateExpenseInput,
  ) {
    await tripsService.getOwnedTrip(tripId, userId);
    await assertExpenseBelongsToTrip(tripId, expenseId);
    if (input.tripStopId) {
      await assertStopBelongsToTrip(tripId, input.tripStopId);
    }
    return expensesRepository.update(expenseId, input);
  },

  async deleteExpense(tripId: string, expenseId: string, userId: string): Promise<void> {
    await tripsService.getOwnedTrip(tripId, userId);
    await assertExpenseBelongsToTrip(tripId, expenseId);
    await expensesRepository.delete(expenseId);
  },
};
