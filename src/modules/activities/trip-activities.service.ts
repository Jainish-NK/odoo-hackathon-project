import { tripActivitiesRepository } from './trip-activities.repository';
import { AddTripActivityInput, UpdateTripActivityInput } from './trip-activities.schema';

import { tripsService } from '@/modules/trips/trips.service';
import { NotFoundError } from '@/utils/errors';

async function assertTripActivityBelongsToTrip(tripId: string, tripActivityId: string) {
  const tripActivity = await tripActivitiesRepository.findById(tripActivityId);
  if (!tripActivity || tripActivity.tripStop.tripId !== tripId) {
    throw new NotFoundError('Trip activity');
  }
  return tripActivity;
}

export const tripActivitiesService = {
  async addActivity(tripId: string, userId: string, input: AddTripActivityInput) {
    await tripsService.getOwnedTrip(tripId, userId);

    const stop = await tripActivitiesRepository.findStopInTrip(tripId, input.stopId);
    if (!stop) throw new NotFoundError('Trip stop');

    const activity = await tripActivitiesRepository.activityExists(input.activityId);
    if (!activity) throw new NotFoundError('Activity');

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
    await assertTripActivityBelongsToTrip(tripId, tripActivityId);

    if (input.stopId) {
      const stop = await tripActivitiesRepository.findStopInTrip(tripId, input.stopId);
      if (!stop) throw new NotFoundError('Trip stop');
    }

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
};
