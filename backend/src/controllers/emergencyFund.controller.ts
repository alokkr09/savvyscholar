import { Response, NextFunction } from 'express';
import { EmergencyFundService } from '../services/emergencyFund.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class EmergencyFundController {
  static async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fund = await EmergencyFundService.get(req.user!.userId);
      ApiResponse.success(res, { fund }, 'Emergency fund details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fund = await EmergencyFundService.update(req.user!.userId, req.body);
      ApiResponse.success(res, { fund }, 'Emergency fund updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async contribute(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount } = req.body as { amount: number };
      const fund = await EmergencyFundService.contribute(req.user!.userId, amount);
      ApiResponse.success(res, { fund }, 'Contribution added to emergency fund.');
    } catch (error) {
      next(error);
    }
  }
}
