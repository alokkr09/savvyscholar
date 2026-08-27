export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Utilities & Bills',
  'Transportation',
  'Academics & Books',
  'Entertainment & Subscriptions',
  'Health & Fitness',
  'Shopping',
  'Personal Care',
  'Travel',
  'Miscellaneous',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Digital Wallet',
  'Other',
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const INVESTMENT_TYPES = [
  'Mutual Funds',
  'Stocks',
  'Index Funds',
  'Fixed Deposit (FD)',
  'Recurring Deposit (RD)',
  'Crypto',
  'Gold & Sovereign Bonds',
  'Public Provident Fund (PPF)',
  'Other',
] as const;

export type InvestmentType = typeof INVESTMENT_TYPES[number];

export const INSURANCE_TYPES = [
  'Health Insurance',
  'Term Life Insurance',
  'Vehicle Insurance',
  'Gadget Insurance',
  'Travel Insurance',
  'Other',
] as const;

export type InsuranceType = typeof INSURANCE_TYPES[number];

export const INSURANCE_FREQUENCIES = [
  'Monthly',
  'Quarterly',
  'Half-Yearly',
  'Annually',
] as const;

export type InsuranceFrequency = typeof INSURANCE_FREQUENCIES[number];

export const SAVINGS_GOAL_CATEGORIES = [
  'Emergency Fund',
  'Gadgets & Tech',
  'Education & Certifications',
  'Travel & Vacation',
  'Vehicle',
  'Career & Projects',
  'Investment Seed',
  'Other',
] as const;

export type SavingsGoalCategory = typeof SAVINGS_GOAL_CATEGORIES[number];

export const SAVINGS_GOAL_STATUS = ['in_progress', 'achieved', 'paused'] as const;
export type SavingsGoalStatus = typeof SAVINGS_GOAL_STATUS[number];
