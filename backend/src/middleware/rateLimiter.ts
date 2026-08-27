import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isTest ? 1000 : 30, // Limit each IP to 30 requests per 15 mins (high limit for testing)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      ApiError.badRequest(
        'Too many authentication attempts from this IP. Please try again after 15 minutes.'
      )
    );
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isTest ? 5000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      ApiError.badRequest(
        'Too many requests from this IP. Please slow down.'
      )
    );
  },
});
