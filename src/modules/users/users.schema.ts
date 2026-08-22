import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9()\-\s]{7,20}$/, 'Invalid phone number')
  .nullable();

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: phoneSchema.optional(),
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
export type CityIdParam = z.infer<typeof cityIdParamSchema>;
