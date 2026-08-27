import { HTTP_STATUS, HttpStatusCode } from '../constants/httpCodes';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, true, details);
  }

  static unauthorized(message = 'Authentication required. Please log in.') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, true);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, true);
  }

  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, true);
  }

  static conflict(message: string) {
    return new ApiError(HTTP_STATUS.CONFLICT, message, true);
  }

  static unprocessable(message: string, details?: unknown) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, true, details);
  }

  static internal(message = 'An unexpected internal server error occurred.') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, false);
  }
}
