import { z } from 'zod';

export const tripIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
});

export const reorderItinerarySchema = z.object({
  items: z
    .array(
      z.object({
        tripActivityId: z.string().uuid(),
        tripStopId: z.string().uuid().optional(),
        date: z.coerce.date().optional(),
        position: z.number().int().min(0),
      }),
    )
    .min(1, 'items must contain at least one entry'),
});
export type ReorderItineraryInput = z.infer<typeof reorderItinerarySchema>;
