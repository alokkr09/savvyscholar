import { Response, NextFunction } from 'express';
import { InvestmentService } from '../services/investment.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class InvestmentController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const investment = await InvestmentService.create(req.user!.userId, req.body);
      ApiResponse.created(res, { investment }, 'Investment asset added.');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await InvestmentService.list(req.user!.userId);
      ApiResponse.success(res, result, 'Investments retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const investment = await InvestmentService.getById(req.user!.userId, req.params.id);
      ApiResponse.success(res, { investment }, 'Investment details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const investment = await InvestmentService.update(req.user!.userId, req.params.id, req.body);
      ApiResponse.success(res, { investment }, 'Investment asset updated.');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await InvestmentService.delete(req.user!.userId, req.params.id);
      ApiResponse.success(res, result, 'Investment asset deleted.');
    } catch (error) {
      next(error);
    }
  }
}
