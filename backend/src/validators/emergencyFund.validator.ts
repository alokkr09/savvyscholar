import Joi from 'joi';

export const updateEmergencyFundSchema = Joi.object({
  targetAmount: Joi.number().min(0).precision(2).optional(),
  currentAmount: Joi.number().min(0).precision(2).optional(),
  monthlyContribution: Joi.number().min(0).precision(2).optional(),
  monthsOfExpensesTarget: Joi.number().integer().min(1).max(36).optional(),
  targetExpensesPerMonth: Joi.number().min(0).precision(2).optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
}).min(1);

export const contributeEmergencyFundSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Contribution amount must be greater than 0',
    'any.required': 'Contribution amount is required',
  }),
});
