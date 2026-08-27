import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await AuthService.updateProfile(req.user!.userId, req.body);
      ApiResponse.success(res, { user: updatedUser }, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(
        req.user!.userId,
        currentPassword,
        newPassword
      );
      ApiResponse.success(res, result, 'Password updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}
