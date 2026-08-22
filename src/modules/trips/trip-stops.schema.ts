import { z } from 'zod';

export const stopIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
  stopId: z.string().uuid('Invalid stop id'),
});

export const createStopSchema = z
  .object({
    cityId: z.string().uuid('Invalid city id'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    position: z.number().int().min(0).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });
export type CreateStopInput = z.infer<typeof createStopSchema>;

export const updateStopSchema = z
  .object({
    cityId: z.string().uuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });
export type UpdateStopInput = z.infer<typeof updateStopSchema>;

export const reorderStopsSchema = z.object({
  order: z
    .array(
      z.object({
        stopId: z.string().uuid(),
        position: z.number().int().min(0),
      }),
    )
    .min(1, 'order must contain at least one stop'),
});
export type ReorderStopsInput = z.infer<typeof reorderStopsSchema>;
