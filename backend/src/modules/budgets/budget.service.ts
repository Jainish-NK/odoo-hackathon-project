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
   *
   * Two independent cost sources are combined and summed, never
   * double-counted, because they live in different tables with no overlap:
   *  - `Expense` rows: costs the user logged by hand (any category).
   *  - `TripActivity` costs: the itinerary's scheduled activities, priced
   *    at `costOverride` if the user set one, otherwise the catalog
   *    `Activity.cost`. These always roll up into the ACTIVITIES category.
   * A manually-logged ACTIVITIES expense and a scheduled activity's cost
   * are two separate rows even if they describe the same real-world spend
   * — this service has no way to deduplicate that, so it's on the user not
   * to log both for the same thing.
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
    const dailyMap = new Map<string, CategoryBreakdown>();

    function addToDay(key: string, category: ExpenseCategory, amount: number): void {
      const bucket = dailyMap.get(key) ?? emptyBreakdown();
      bucket[category] += amount;
      dailyMap.set(key, bucket);
    }

    for (const expense of expenses) {
      const amount = Number(expense.amount);
      byCategory[expense.category] += amount;
      addToDay(dateKey(expense.date), expense.category, amount);
    }

    for (const item of activityCosts) {
      const amount = Number(item.costOverride ?? item.activity.cost);
      byCategory.ACTIVITIES += amount;
      addToDay(dateKey(item.date), ExpenseCategory.ACTIVITIES, amount);
    }

    const total = Object.values(byCategory).reduce((sum, value) => sum + value, 0);
    const durationDays = tripDurationDays(trip.startDate, trip.endDate);
    const budgetAmount = trip.budgetAmount !== null ? Number(trip.budgetAmount) : null;
    const averagePerDayBudget = budgetAmount !== null ? budgetAmount / durationDays : null;

    const dailyBreakdown = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, categories]) => ({
        date,
        total: round2(Object.values(categories).reduce((sum, value) => sum + value, 0)),
        byCategory: mapValues(categories, round2),
      }));

    // Days that individually exceed the trip's fair-share daily budget
    // (budgetAmount spread evenly across its duration). There's no
    // per-day budget field on Trip, so this is the simplest deterministic
    // definition of "over budget for that day" derivable from what's
    // actually stored.
    const overBudgetDays =
      averagePerDayBudget !== null
        ? dailyBreakdown.filter((day) => day.total > averagePerDayBudget).map((day) => day.date)
        : [];

    return {
      tripId: trip.id,
      tripName: trip.name,
      currency: 'USD',
      budgetAmount,
      totalCost: round2(total),
      costPerDay: round2(total / durationDays),
      averagePerDayBudget: averagePerDayBudget !== null ? round2(averagePerDayBudget) : null,
      durationDays,
      byCategory: mapValues(byCategory, round2),
      dailyBreakdown,
      overBudgetDays,
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
