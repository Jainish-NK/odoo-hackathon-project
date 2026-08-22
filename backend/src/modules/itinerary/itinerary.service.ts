import { itineraryRepository } from './itinerary.repository';
import { ReorderItineraryInput } from './itinerary.schema';

import { tripsService } from '@/modules/trips/trips.service';
import { NotFoundError, ValidationError } from '@/utils/errors';

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function enumerateDates(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  while (cursor <= last) {
    dates.push(toDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export const itineraryService = {
  /**
   * Returns the trip's itinerary as a structured, frontend-ready day-wise
   * breakdown so the client never needs to reconstruct relationships itself.
   */
  async getItinerary(tripId: string, userId: string) {
    await tripsService.getOwnedTrip(tripId, userId);

    const trip = await itineraryRepository.getTripWithItinerary(tripId);
    if (!trip) throw new NotFoundError('Trip');

    type ItineraryActivity = {
      id: string;
      stopId: string;
      city: { id: string; name: string; country: string };
      activity: {
        id: string;
        name: string;
        category: string;
        durationMinutes: number;
        imageUrl: string | null;
      };
      date: string;
      startTime: string | null;
      endTime: string | null;
      position: number;
      cost: number;
      notes: string | null;
    };

    const activitiesByDate = new Map<string, ItineraryActivity[]>();

    for (const stop of trip.stops) {
      for (const tripActivity of stop.tripActivities) {
        const dateKey = toDateKey(tripActivity.date);
        const bucket = activitiesByDate.get(dateKey) ?? [];
        bucket.push({
          id: tripActivity.id,
          stopId: stop.id,
          city: { id: stop.city.id, name: stop.city.name, country: stop.city.country },
          activity: {
            id: tripActivity.activity.id,
            name: tripActivity.activity.name,
            category: tripActivity.activity.category,
            durationMinutes: tripActivity.activity.durationMinutes,
            imageUrl: tripActivity.activity.imageUrl,
          },
          date: dateKey,
          startTime: tripActivity.startTime,
          endTime: tripActivity.endTime,
          position: tripActivity.position,
          cost: Number(tripActivity.costOverride ?? tripActivity.activity.cost),
          notes: tripActivity.notes,
        });
        activitiesByDate.set(dateKey, bucket);
      }
    }

    const days = enumerateDates(trip.startDate, trip.endDate).map((date, index) => {
      const activities = (activitiesByDate.get(date) ?? []).sort((a, b) => a.position - b.position);
      return {
        dayNumber: index + 1,
        date,
        activities,
      };
    });

    return {
      tripId: trip.id,
      tripName: trip.name,
      startDate: toDateKey(trip.startDate),
      endDate: toDateKey(trip.endDate),
      days,
    };
  },

  async reorderItinerary(tripId: string, userId: string, input: ReorderItineraryInput) {
    await tripsService.getOwnedTrip(tripId, userId);

    const validIds = await itineraryRepository.getValidTripActivityIds(tripId);
    const invalid = input.items.filter((item) => !validIds.has(item.tripActivityId));
    if (invalid.length > 0) {
      throw new ValidationError('One or more itinerary items do not belong to this trip', {
        invalidIds: invalid.map((i) => i.tripActivityId),
      });
    }

    await itineraryRepository.reorderMany(input.items);
    return itineraryService.getItinerary(tripId, userId);
  },
};
