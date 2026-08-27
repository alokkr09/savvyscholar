import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { User, IUser } from '../models/User';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    currency: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No authorization token provided.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Malformed authorization token.');
    }

    // Verify token
    let decoded: AuthenticatedUserPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUserPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Your session has expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid authentication token.');
    }

    // Verify user existence in DB
    const user = await User.findById(decoded.id).select('_id email name currency');
    if (!user) {
      throw ApiError.unauthorized('The user account associated with this token no longer exists.');
    }

    // Attach user payload to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      currency: user.currency || 'INR',
    };

    next();
  } catch (error) {
    next(error);
  }
};
