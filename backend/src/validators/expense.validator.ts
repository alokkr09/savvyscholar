import Joi from 'joi';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../constants/categories';

export const createExpenseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Expense title is required',
    'any.required': 'Expense title is required',
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  category: Joi.string()
    .valid(...EXPENSE_CATEGORIES)
    .required()
    .messages({
      'any.only': 'Please select a valid expense category',
      'any.required': 'Category is required',
    }),
  description: Joi.string().trim().max(500).allow('').optional(),
  date: Joi.date().iso().optional().default(() => new Date().toISOString()),
  paymentMethod: Joi.string()
    .valid(...PAYMENT_METHODS)
    .optional()
    .default('UPI'),
  tags: Joi.array().items(Joi.string().trim().max(30)).optional().default([]),
});

export const updateExpenseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).optional(),
  amount: Joi.number().positive().precision(2).optional(),
  category: Joi.string().valid(...EXPENSE_CATEGORIES).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  date: Joi.date().iso().optional(),
  paymentMethod: Joi.string().valid(...PAYMENT_METHODS).optional(),
  tags: Joi.array().items(Joi.string().trim().max(30)).optional(),
}).min(1);

export const queryExpenseSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().allow('').optional(),
  category: Joi.string().valid(...EXPENSE_CATEGORIES, 'all', '').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  paymentMethod: Joi.string().valid(...PAYMENT_METHODS, 'all', '').optional(),
  sortBy: Joi.string().valid('date', 'amount', 'title', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
