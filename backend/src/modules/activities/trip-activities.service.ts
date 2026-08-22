import { TripStop } from '@prisma/client';

import { tripActivitiesRepository } from './trip-activities.repository';
import {
  AddTripActivityInput,
  ReorderTripActivitiesInput,
  UpdateTripActivityInput,
} from './trip-activities.schema';

import { tripsService } from '@/modules/trips/trips.service';
import { NotFoundError, ValidationError } from '@/utils/errors';

async function assertTripActivityBelongsToTrip(tripId: string, tripActivityId: string) {
  const tripActivity = await tripActivitiesRepository.findById(tripActivityId);
  if (!tripActivity || tripActivity.tripStop.tripId !== tripId) {
    throw new NotFoundError('Trip activity');
  }
  return tripActivity;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** An activity scheduled within a stop must fall on one of that stop's days. */
function assertActivityDateWithinStop(stop: TripStop, date: Date): void {
  const dateKey = toDateKey(date);
  if (dateKey < toDateKey(stop.startDate) || dateKey > toDateKey(stop.endDate)) {
    throw new ValidationError("Activity date must fall within the trip stop's date range");
  }
}

/** An activity can only be scheduled at a stop in the same city it's cataloged under. */
function assertActivityBelongsToStopCity(activityCityId: string, stopCityId: string): void {
  if (activityCityId !== stopCityId) {
    throw new ValidationError('Activity does not belong to the city of the selected trip stop');
  }
}

export const tripActivitiesService = {
  async addActivity(tripId: string, userId: string, input: AddTripActivityInput) {
    await tripsService.getOwnedTrip(tripId, userId);

    const stop = await tripActivitiesRepository.findStopInTrip(tripId, input.stopId);
    if (!stop) throw new NotFoundError('Trip stop');

    const activity = await tripActivitiesRepository.activityExists(input.activityId);
    if (!activity) throw new NotFoundError('Activity');

    assertActivityBelongsToStopCity(activity.cityId, stop.cityId);
    assertActivityDateWithinStop(stop, input.date);

    return tripActivitiesRepository.create({
      tripStopId: input.stopId,
      activityId: input.activityId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      position: input.position ?? 0,
      notes: input.notes,
      costOverride: input.costOverride,
    });
  },

  async updateActivity(
    tripId: string,
    tripActivityId: string,
    userId: string,
    input: UpdateTripActivityInput,
  ) {
    await tripsService.getOwnedTrip(tripId, userId);
    const tripActivity = await assertTripActivityBelongsToTrip(tripId, tripActivityId);

    let effectiveStop: TripStop = tripActivity.tripStop;
    if (input.stopId) {
      const stop = await tripActivitiesRepository.findStopInTrip(tripId, input.stopId);
      if (!stop) throw new NotFoundError('Trip stop');
      assertActivityBelongsToStopCity(tripActivity.activity.cityId, stop.cityId);
      effectiveStop = stop;
    }

    assertActivityDateWithinStop(effectiveStop, input.date ?? tripActivity.date);

    return tripActivitiesRepository.update(tripActivityId, {
      ...(input.stopId ? { tripStop: { connect: { id: input.stopId } } } : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
      ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
      ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.costOverride !== undefined ? { costOverride: input.costOverride } : {}),
    });
  },

  async removeActivity(tripId: string, tripActivityId: string, userId: string): Promise<void> {
    await tripsService.getOwnedTrip(tripId, userId);
    await assertTripActivityBelongsToTrip(tripId, tripActivityId);
    await tripActivitiesRepository.delete(tripActivityId);
  },

  async reorderActivities(tripId: string, userId: string, input: ReorderTripActivitiesInput) {
    await tripsService.getOwnedTrip(tripId, userId);

    const existing = await tripActivitiesRepository.listIdsByTrip(tripId);
    const existingIds = new Set(existing.map((a) => a.id));
    const requestedIds = input.order.map((o) => o.tripActivityId);

    if (
      requestedIds.length !== existing.length ||
      !requestedIds.every((id) => existingIds.has(id))
    ) {
      throw new ValidationError('order must include exactly the current activities of this trip');
    }

    return tripActivitiesRepository.reorder(input.order);
  },
};
