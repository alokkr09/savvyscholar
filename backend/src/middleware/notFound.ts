import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
