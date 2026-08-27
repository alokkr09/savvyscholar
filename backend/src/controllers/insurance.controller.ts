import { Response, NextFunction } from 'express';
import { InsuranceService } from '../services/insurance.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class InsuranceController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await InsuranceService.create(req.user!.userId, req.body);
      ApiResponse.created(res, { policy }, 'Insurance policy added.');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await InsuranceService.list(req.user!.userId);
      ApiResponse.success(res, result, 'Insurance policies retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await InsuranceService.getById(req.user!.userId, req.params.id);
      ApiResponse.success(res, { policy }, 'Insurance policy details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await InsuranceService.update(req.user!.userId, req.params.id, req.body);
      ApiResponse.success(res, { policy }, 'Insurance policy updated.');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await InsuranceService.delete(req.user!.userId, req.params.id);
      ApiResponse.success(res, result, 'Insurance policy deleted.');
    } catch (error) {
      next(error);
    }
  }
}
