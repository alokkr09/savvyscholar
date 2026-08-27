import Joi from 'joi';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export const createBudgetSchema = Joi.object({
  category: Joi.string()
    .valid(...EXPENSE_CATEGORIES)
    .required()
    .messages({
      'any.only': 'Please select a valid expense category',
      'any.required': 'Category is required',
    }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Budget amount must be greater than 0',
    'any.required': 'Budget amount is required',
  }),
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .default(() => new Date().toISOString().substring(0, 7))
    .messages({
      'string.pattern.base': 'Month must be in YYYY-MM format (e.g. 2026-08)',
    }),
  alertThreshold: Joi.number().min(1).max(100).optional().default(80),
});

export const updateBudgetSchema = Joi.object({
  amount: Joi.number().positive().precision(2).optional(),
  alertThreshold: Joi.number().min(1).max(100).optional(),
}).min(1);
