import { Response, NextFunction } from 'express';
import { SavingsGoalService } from '../services/savingsGoal.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class SavingsGoalController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await SavingsGoalService.create(req.user!.userId, req.body);
      ApiResponse.created(res, { goal }, 'Savings goal created successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query as { status?: string };
      const result = await SavingsGoalService.list(req.user!.userId, status);
      ApiResponse.success(res, result, 'Savings goals retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await SavingsGoalService.getById(req.user!.userId, req.params.id);
      ApiResponse.success(res, { goal }, 'Savings goal retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await SavingsGoalService.update(req.user!.userId, req.params.id, req.body);
      ApiResponse.success(res, { goal }, 'Savings goal updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async depositOrWithdraw(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, type } = req.body as { amount: number; type: 'deposit' | 'withdraw' };
      const goal = await SavingsGoalService.processTransaction(
        req.user!.userId,
        req.params.id,
        amount,
        type
      );
      const actionText = type === 'deposit' ? 'Funds added to goal' : 'Funds withdrawn from goal';
      ApiResponse.success(res, { goal }, `${actionText} successfully.`);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SavingsGoalService.delete(req.user!.userId, req.params.id);
      ApiResponse.success(res, result, 'Savings goal deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
}
