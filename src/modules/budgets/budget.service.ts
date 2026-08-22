import { ExpenseCategory } from '@prisma/client';

import { budgetRepository } from './budget.repository';

import { tripsService } from '@/modules/trips/trips.service';
import { NotFoundError } from '@/utils/errors';

type CategoryBreakdown = Record<ExpenseCategory, number>;

function emptyBreakdown(): CategoryBreakdown {
  return {
    TRANSPORT: 0,
    ACCOMMODATION: 0,
    ACTIVITIES: 0,
    MEALS: 0,
    OTHER: 0,
  };
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function tripDurationDays(startDate: Date, endDate: Date): number {
  const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

export const budgetService = {
  /**
   * Calculates the full cost breakdown for a trip server-side so the
   * frontend can render charts directly from the response.
   */
  async getBudget(tripId: string, userId: string) {
    await tripsService.getOwnedTrip(tripId, userId);

    const trip = await budgetRepository.getTripForBudget(tripId);
    if (!trip) throw new NotFoundError('Trip');

    const [expenses, activityCosts] = await Promise.all([
      budgetRepository.getExpenses(tripId),
      budgetRepository.getActivityCosts(tripId),
    ]);

    const byCategory = emptyBreakdown();
    const dailyMap = new Map<string, number>();

    for (const expense of expenses) {
      const amount = Number(expense.amount);
      byCategory[expense.category] += amount;
      const key = dateKey(expense.date);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + amount);
    }

    for (const item of activityCosts) {
      const amount = Number(item.costOverride ?? item.activity.cost);
      byCategory.ACTIVITIES += amount;
      const key = dateKey(item.date);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + amount);
    }

    const total = Object.values(byCategory).reduce((sum, value) => sum + value, 0);
    const durationDays = tripDurationDays(trip.startDate, trip.endDate);
    const budgetAmount = trip.budgetAmount !== null ? Number(trip.budgetAmount) : null;

    const dailyBreakdown = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount: round2(amount) }));

    return {
      tripId: trip.id,
      tripName: trip.name,
      currency: 'USD',
      budgetAmount,
      totalCost: round2(total),
      costPerDay: round2(total / durationDays),
      durationDays,
      byCategory: mapValues(byCategory, round2),
      dailyBreakdown,
      remainingBudget: budgetAmount !== null ? round2(budgetAmount - total) : null,
      isOverBudget: budgetAmount !== null ? total > budgetAmount : null,
    };
  },
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function mapValues<T extends Record<string, number>>(obj: T, fn: (value: number) => number): T {
  const result = {} as T;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    result[key] = fn(obj[key]) as T[keyof T];
  }
  return result;
}
