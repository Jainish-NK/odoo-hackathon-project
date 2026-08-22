import { TripStatus, TripVisibility } from '@prisma/client';
import { z } from 'zod';

export const tripIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
});

export const createTripSchema = z
  .object({
    name: z.string().trim().min(1, 'Trip name is required').max(150),
    description: z.string().trim().max(2000).optional(),
    coverImageUrl: z.string().url().max(2048).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    visibility: z.nativeEnum(TripVisibility).optional(),
    budgetAmount: z.number().min(0).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });
export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    coverImageUrl: z.string().url().max(2048).nullable().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.nativeEnum(TripStatus).optional(),
    visibility: z.nativeEnum(TripVisibility).optional(),
    budgetAmount: z.number().min(0).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

const TRIP_SORT_VALUES = [
  'startDate',
  '-startDate',
  'endDate',
  '-endDate',
  'createdAt',
  '-createdAt',
  'updatedAt',
  '-updatedAt',
  'name',
  '-name',
] as const;

export const listTripsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(TripStatus).optional(),
  sort: z.enum(TRIP_SORT_VALUES).optional(),
});
export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
export type TripSort = (typeof TRIP_SORT_VALUES)[number];
