import { z } from 'zod';

export const cityIdParamSchema = z.object({
  cityId: z.string().uuid('Invalid city id'),
});

export const listCitiesQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  country: z.string().trim().min(1).max(100).optional(),
  region: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListCitiesQuery = z.infer<typeof listCitiesQuerySchema>;
