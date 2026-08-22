import { z } from 'zod';

export const tripIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
});

const COMMUNITY_SORT_VALUES = ['newest', 'popular', 'recentlyUpdated'] as const;

export const listCommunityTripsQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  city: z.string().uuid('city must be a valid city id').optional(),
  sort: z.enum(COMMUNITY_SORT_VALUES).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListCommunityTripsQuery = z.infer<typeof listCommunityTripsQuerySchema>;
export type CommunitySort = (typeof COMMUNITY_SORT_VALUES)[number];

export const shareSlugParamSchema = z.object({
  shareSlug: z.string().min(1, 'Invalid share link'),
});
export type ShareSlugParam = z.infer<typeof shareSlugParamSchema>;

export const copyTripSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
});
export type CopyTripInput = z.infer<typeof copyTripSchema>;
