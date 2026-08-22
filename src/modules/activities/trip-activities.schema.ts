import { z } from 'zod';

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm 24-hour format');

export const tripActivityParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
  activityId: z.string().uuid('Invalid trip activity id'),
});

export const tripIdOnlyParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
});

export const addTripActivitySchema = z.object({
  stopId: z.string().uuid('Invalid stop id'),
  activityId: z.string().uuid('Invalid activity id'),
  date: z.coerce.date(),
  startTime: timeString.optional(),
  endTime: timeString.optional(),
  position: z.number().int().min(0).optional(),
  notes: z.string().trim().max(1000).optional(),
  costOverride: z.number().min(0).optional(),
});
export type AddTripActivityInput = z.infer<typeof addTripActivitySchema>;

export const updateTripActivitySchema = z
  .object({
    stopId: z.string().uuid().optional(),
    date: z.coerce.date().optional(),
    startTime: timeString.nullable().optional(),
    endTime: timeString.nullable().optional(),
    position: z.number().int().min(0).optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    costOverride: z.number().min(0).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });
export type UpdateTripActivityInput = z.infer<typeof updateTripActivitySchema>;
