import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { HTTP_STATUS } from '../constants/httpCodes';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Transform known error types into ApiError
  if (!(error instanceof ApiError)) {
    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = ApiError.conflict(`An account with that ${field} already exists.`);
    }
    // Mongoose validation error
    else if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e: any) => e.message);
      error = ApiError.badRequest('Validation Failed', messages);
    }
    // Mongoose CastError (invalid ObjectId)
    else if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    }
    // JWT Authentication errors
    else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid authentication token.');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Authentication token has expired. Please log in again.');
    }
    // SyntaxError in body parser
    else if (error instanceof SyntaxError && 'body' in error) {
      error = ApiError.badRequest('Invalid JSON payload in request body.');
    }
    // Generic fallback error
    else {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal Server Error';
      error = new ApiError(statusCode, message, false);
    }
  }

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isOperational = error.isOperational;

  // Log non-operational (server crash/programming) errors
  if (!isOperational || statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(`[UNHANDLED ERROR] ${req.method} ${req.originalUrl}:`, {
      message: error.message,
      stack: err.stack,
    });
  } else {
    logger.warn(`[CLIENT ERROR] ${req.method} ${req.originalUrl} (${statusCode}): ${error.message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: error.message,
    ...(error.details !== undefined && { details: error.details }),
    ...(env.isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};
