import Joi from 'joi';
import { INVESTMENT_TYPES } from '../constants/categories';

export const createInvestmentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Asset title is required',
    'any.required': 'Asset title is required',
  }),
  type: Joi.string()
    .valid(...INVESTMENT_TYPES)
    .required()
    .messages({
      'any.only': 'Please select a valid investment asset type',
      'any.required': 'Investment type is required',
    }),
  investedAmount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Invested amount must be greater than 0',
    'any.required': 'Invested amount is required',
  }),
  currentValue: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Current valuation cannot be negative',
    'any.required': 'Current valuation is required',
  }),
  purchaseDate: Joi.date().iso().optional().default(() => new Date().toISOString()),
  notes: Joi.string().trim().max(500).allow('').optional(),
});

export const updateInvestmentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).optional(),
  type: Joi.string().valid(...INVESTMENT_TYPES).optional(),
  investedAmount: Joi.number().positive().precision(2).optional(),
  currentValue: Joi.number().min(0).precision(2).optional(),
  purchaseDate: Joi.date().iso().optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
}).min(1);
