import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class DashboardController {
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await DashboardService.getSummary(req.user!.userId);
      ApiResponse.success(res, summary, 'Dashboard summary retrieved.');
    } catch (error) {
      next(error);
    }
  }
}
