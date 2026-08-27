import Joi from 'joi';
import { INSURANCE_TYPES, INSURANCE_FREQUENCIES } from '../constants/categories';

export const createInsuranceSchema = Joi.object({
  policyName: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Policy name is required',
    'any.required': 'Policy name is required',
  }),
  provider: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Insurance provider name is required',
    'any.required': 'Provider is required',
  }),
  policyNumber: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Policy number is required',
    'any.required': 'Policy number is required',
  }),
  policyType: Joi.string()
    .valid(...INSURANCE_TYPES)
    .required()
    .messages({
      'any.only': 'Please select a valid insurance policy type',
      'any.required': 'Policy type is required',
    }),
  premiumAmount: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Premium amount cannot be negative',
    'any.required': 'Premium amount is required',
  }),
  premiumFrequency: Joi.string()
    .valid(...INSURANCE_FREQUENCIES)
    .optional()
    .default('Annually'),
  coverageAmount: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Coverage amount cannot be negative',
    'any.required': 'Coverage amount is required',
  }),
  startDate: Joi.date().iso().optional().allow(null),
  renewalDate: Joi.date().iso().required().messages({
    'any.required': 'Renewal date is required',
  }),
  status: Joi.string().valid('Active', 'Expired', 'Pending').optional().default('Active'),
  notes: Joi.string().trim().max(500).allow('').optional(),
});

export const updateInsuranceSchema = Joi.object({
  policyName: Joi.string().trim().min(1).max(100).optional(),
  provider: Joi.string().trim().min(1).max(100).optional(),
  policyNumber: Joi.string().trim().min(1).max(50).optional(),
  policyType: Joi.string().valid(...INSURANCE_TYPES).optional(),
  premiumAmount: Joi.number().min(0).precision(2).optional(),
  premiumFrequency: Joi.string().valid(...INSURANCE_FREQUENCIES).optional(),
  coverageAmount: Joi.number().min(0).precision(2).optional(),
  startDate: Joi.date().iso().optional().allow(null),
  renewalDate: Joi.date().iso().optional(),
  status: Joi.string().valid('Active', 'Expired', 'Pending').optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
}).min(1);
