import { Response, NextFunction } from 'express';
import { BudgetService } from '../services/budget.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class BudgetController {
  static async upsert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await BudgetService.upsert(req.user!.userId, req.body);
      ApiResponse.success(res, { budget }, 'Budget saved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { month } = req.query as { month?: string };
      const result = await BudgetService.listWithSpending(req.user!.userId, month);
      ApiResponse.success(res, result, 'Budgets and spending retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await BudgetService.update(req.user!.userId, req.params.id, req.body);
      ApiResponse.success(res, { budget }, 'Budget updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BudgetService.delete(req.user!.userId, req.params.id);
      ApiResponse.success(res, result, 'Budget removed successfully.');
    } catch (error) {
      next(error);
    }
  }
}
