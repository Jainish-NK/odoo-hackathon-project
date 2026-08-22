import { ExpenseCategory } from '@prisma/client';
import { z } from 'zod';

export const tripIdOnlyParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
});

export const expenseIdParamSchema = z.object({
  tripId: z.string().uuid('Invalid trip id'),
  expenseId: z.string().uuid('Invalid expense id'),
});

export const createExpenseSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().trim().max(500).optional(),
  amount: z.number().positive('amount must be greater than 0'),
  date: z.coerce.date(),
  tripStopId: z.string().uuid('Invalid stop id').optional(),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z
  .object({
    category: z.nativeEnum(ExpenseCategory).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    amount: z.number().positive().optional(),
    date: z.coerce.date().optional(),
    tripStopId: z.string().uuid('Invalid stop id').nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
