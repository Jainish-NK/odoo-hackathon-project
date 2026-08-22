import { Request, Response } from 'express';

import { CreateExpenseInput, UpdateExpenseInput } from './expenses.schema';
import { expensesService } from './expenses.service';

import { sendSuccess } from '@/utils/response';

export const expensesController = {
  async list(req: Request<{ tripId: string }>, res: Response): Promise<void> {
    const expenses = await expensesService.listExpenses(req.params.tripId, req.user!.id);
    sendSuccess(res, expenses);
  },

  async create(
    req: Request<{ tripId: string }, unknown, CreateExpenseInput>,
    res: Response,
  ): Promise<void> {
    const expense = await expensesService.addExpense(req.params.tripId, req.user!.id, req.body);
    sendSuccess(res, expense, 201);
  },

  async update(
    req: Request<{ tripId: string; expenseId: string }, unknown, UpdateExpenseInput>,
    res: Response,
  ): Promise<void> {
    const expense = await expensesService.updateExpense(
      req.params.tripId,
      req.params.expenseId,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, expense);
  },

  async remove(req: Request<{ tripId: string; expenseId: string }>, res: Response): Promise<void> {
    await expensesService.deleteExpense(req.params.tripId, req.params.expenseId, req.user!.id);
    sendSuccess(res, { message: 'Expense deleted' });
  },
};
