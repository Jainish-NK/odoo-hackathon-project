import { z } from 'zod';

export const tripIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
});

export const listCommunityTripsQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListCommunityTripsQuery = z.infer<typeof listCommunityTripsQuerySchema>;

export const copyTripSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
});
export type CopyTripInput = z.infer<typeof copyTripSchema>;
