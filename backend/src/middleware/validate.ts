import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ApiError } from '../utils/apiError';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: Schema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const dataToValidate = req[target];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(ApiError.badRequest(errorMessages[0], errorMessages));
    }

    // Replace request payload with sanitized, validated value
    req[target] = value;
    next();
  };
};
