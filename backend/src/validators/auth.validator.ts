import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'Name must be text',
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required',
    }),
  monthlyIncome: Joi.number().min(0).optional().messages({
    'number.min': 'Monthly income cannot be negative',
  }),
  currency: Joi.string().trim().length(3).uppercase().optional().default('INR'),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  monthlyIncome: Joi.number().min(0).optional(),
  currency: Joi.string().trim().length(3).uppercase().optional(),
  avatar: Joi.string().allow('').optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.pattern.base': 'New password must contain at least one letter and one number',
      'any.required': 'New password is required',
    }),
});
