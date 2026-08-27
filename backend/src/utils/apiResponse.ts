import { Response } from 'express';
import { HTTP_STATUS, HttpStatusCode } from '../constants/httpCodes';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: HttpStatusCode;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static send<T>({
    res,
    statusCode = HTTP_STATUS.OK,
    message = 'Success',
    data,
    meta,
  }: ApiResponseOptions<T>) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully') {
    return ApiResponse.send({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message,
      data,
    });
  }

  static success<T>(res: Response, data: T, message = 'Operation successful', meta?: Record<string, unknown>) {
    return ApiResponse.send({
      res,
      statusCode: HTTP_STATUS.OK,
      message,
      data,
      meta,
    });
  }
}
