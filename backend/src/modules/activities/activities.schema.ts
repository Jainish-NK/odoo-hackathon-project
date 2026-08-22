import { ActivityCategory } from '@prisma/client';
import { z } from 'zod';

export const activityIdParamSchema = z.object({
  activityId: z.string().uuid('Invalid activity id'),
});

export const listActivitiesQuerySchema = z.object({
  city: z.string().uuid('city must be a valid city id').optional(),
  category: z.nativeEnum(ActivityCategory).optional(),
  minCost: z.coerce.number().min(0).optional(),
  maxCost: z.coerce.number().min(0).optional(),
  duration: z.coerce.number().int().positive().optional(), // max duration in minutes
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;
