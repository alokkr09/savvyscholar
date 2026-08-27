import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class AnalyticsController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
      const data = await AnalyticsService.getOverview(req.user!.userId, months);
      ApiResponse.success(res, data, 'Analytics overview generated.');
    } catch (error) {
      next(error);
    }
  }
}
