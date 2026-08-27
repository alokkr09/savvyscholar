import Joi from 'joi';
import { SAVINGS_GOAL_CATEGORIES, SAVINGS_GOAL_STATUS } from '../constants/categories';

export const createSavingsGoalSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Goal title is required',
    'any.required': 'Goal title is required',
  }),
  targetAmount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Target amount must be greater than 0',
    'any.required': 'Target amount is required',
  }),
  currentAmount: Joi.number().min(0).precision(2).optional().default(0),
  targetDate: Joi.date().iso().optional().allow(null),
  category: Joi.string()
    .valid(...SAVINGS_GOAL_CATEGORIES)
    .optional()
    .default('Other'),
  status: Joi.string()
    .valid(...SAVINGS_GOAL_STATUS)
    .optional()
    .default('in_progress'),
  notes: Joi.string().trim().max(500).allow('').optional(),
});

export const updateSavingsGoalSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).optional(),
  targetAmount: Joi.number().positive().precision(2).optional(),
  currentAmount: Joi.number().min(0).precision(2).optional(),
  targetDate: Joi.date().iso().optional().allow(null),
  category: Joi.string().valid(...SAVINGS_GOAL_CATEGORIES).optional(),
  status: Joi.string().valid(...SAVINGS_GOAL_STATUS).optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
}).min(1);

export const depositWithdrawSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  type: Joi.string().valid('deposit', 'withdraw').required().messages({
    'any.only': 'Type must be either deposit or withdraw',
    'any.required': 'Transaction type is required',
  }),
});
