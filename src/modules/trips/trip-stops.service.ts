import { NotFoundError, ValidationError } from '@/utils/errors';

import { tripsService } from './trips.service';
import { tripStopsRepository } from './trip-stops.repository';
import { CreateStopInput, ReorderStopsInput, UpdateStopInput } from './trip-stops.schema';

async function assertStopBelongsToTrip(tripId: string, stopId: string) {
  const stop = await tripStopsRepository.findById(stopId);
  if (!stop || stop.tripId !== tripId) throw new NotFoundError('Trip stop');
  return stop;
}

export const tripStopsService = {
  async listStops(tripId: string, userId: string) {
    await tripsService.getOwnedTrip(tripId, userId);
    return tripStopsRepository.listByTrip(tripId);
  },

  async addStop(tripId: string, userId: string, input: CreateStopInput) {
    await tripsService.getOwnedTrip(tripId, userId);

    const city = await tripStopsRepository.cityExists(input.cityId);
    if (!city) throw new NotFoundError('City');

    const position = input.position ?? (await tripStopsRepository.nextPosition(tripId));

    return tripStopsRepository.create({
      tripId,
      cityId: input.cityId,
      startDate: input.startDate,
      endDate: input.endDate,
      position,
    });
  },

  async updateStop(tripId: string, stopId: string, userId: string, input: UpdateStopInput) {
    await tripsService.getOwnedTrip(tripId, userId);
    await assertStopBelongsToTrip(tripId, stopId);

    if (input.cityId) {
      const city = await tripStopsRepository.cityExists(input.cityId);
      if (!city) throw new NotFoundError('City');
    }

    return tripStopsRepository.update(stopId, input);
  },

  async deleteStop(tripId: string, stopId: string, userId: string): Promise<void> {
    await tripsService.getOwnedTrip(tripId, userId);
    await assertStopBelongsToTrip(tripId, stopId);
    await tripStopsRepository.delete(stopId);
  },

  async reorderStops(tripId: string, userId: string, input: ReorderStopsInput) {
    await tripsService.getOwnedTrip(tripId, userId);

    const existingStops = await tripStopsRepository.listByTrip(tripId);
    const existingIds = new Set(existingStops.map((s) => s.id));
    const requestedIds = input.order.map((o) => o.stopId);

    if (requestedIds.length !== existingStops.length || !requestedIds.every((id) => existingIds.has(id))) {
      throw new ValidationError('order must include exactly the current stops of this trip');
    }

    return tripStopsRepository.reorder(tripId, input.order);
  },
};
