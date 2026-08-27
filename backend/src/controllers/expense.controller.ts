import { Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class ExpenseController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.create(req.user!.userId, req.body);
      ApiResponse.created(res, { expense }, 'Expense created successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ExpenseService.list(req.user!.userId, req.query as any);
      ApiResponse.success(res, result, 'Expenses retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.getById(req.user!.userId, req.params.id);
      ApiResponse.success(res, { expense }, 'Expense details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.update(req.user!.userId, req.params.id, req.body);
      ApiResponse.success(res, { expense }, 'Expense updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ExpenseService.delete(req.user!.userId, req.params.id);
      ApiResponse.success(res, result, 'Expense deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const breakdown = await ExpenseService.getCategoryBreakdown(
        req.user!.userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      ApiResponse.success(res, { breakdown }, 'Expense summary retrieved.');
    } catch (error) {
      next(error);
    }
  }
}
