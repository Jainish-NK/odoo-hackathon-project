import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    profilePhotoUrl: z.string().url().max(2048).nullable().optional(),
    languagePreference: z.string().trim().min(2).max(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const cityIdParamSchema = z.object({
  cityId: z.string().uuid('Invalid city id'),
});

export const saveDestinationSchema = z.object({
  cityId: z.string().uuid('Invalid city id'),
});
export type SaveDestinationInput = z.infer<typeof saveDestinationSchema>;
