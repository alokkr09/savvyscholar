import {
  Utensils,
  Home,
  Zap,
  Car,
  GraduationCap,
  Tv,
  HeartPulse,
  ShoppingBag,
  Smile,
  Plane,
  MoreHorizontal,
  Wallet,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  LucideIcon,
} from 'lucide-react';
import { ExpenseCategory, PaymentMethod } from '../types/expense.types';
import { InvestmentType } from '../types/investment.types';
import { InsuranceType, InsuranceFrequency } from '../types/insurance.types';
import { SavingsGoalCategory } from '../types/savings.types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Digital Wallet',
  'Other',
];

export const INVESTMENT_TYPES: InvestmentType[] = [
  'Mutual Funds',
  'Stocks',
  'Index Funds',
  'Fixed Deposit (FD)',
  'Recurring Deposit (RD)',
  'Crypto',
  'Gold & Sovereign Bonds',
  'Public Provident Fund (PPF)',
  'Other',
];

export const INSURANCE_TYPES: InsuranceType[] = [
  'Health Insurance',
  'Term Life Insurance',
  'Vehicle Insurance',
  'Gadget Insurance',
  'Travel Insurance',
  'Other',
];

export const INSURANCE_FREQUENCIES: InsuranceFrequency[] = [
  'Monthly',
  'Quarterly',
  'Half-Yearly',
  'Annually',
];

export const SAVINGS_GOAL_CATEGORIES: SavingsGoalCategory[] = [
  'Emergency Fund',
  'Gadgets & Tech',
  'Education & Certifications',
  'Travel & Vacation',
  'Vehicle',
  'Career & Projects',
  'Investment Seed',
  'Other',
];

export const CATEGORY_COLORS: Record<
  ExpenseCategory,
  { bg: string; text: string; ring: string; border: string; hex: string }
> = {
  'Food & Dining': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-600/20',
    border: 'border-amber-200',
    hex: '#f59e0b',
  },
  'Housing & Rent': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-600/20',
    border: 'border-blue-200',
    hex: '#3b82f6',
  },
  'Utilities & Bills': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    ring: 'ring-cyan-600/20',
    border: 'border-cyan-200',
    hex: '#06b6d4',
  },
  'Transportation': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    ring: 'ring-indigo-600/20',
    border: 'border-indigo-200',
    hex: '#6366f1',
  },
  'Academics & Books': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-600/20',
    border: 'border-emerald-200',
    hex: '#10b981',
  },
  'Entertainment & Subscriptions': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'ring-purple-600/20',
    border: 'border-purple-200',
    hex: '#a855f7',
  },
  'Health & Fitness': {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'ring-rose-600/20',
    border: 'border-rose-200',
    hex: '#f43f5e',
  },
  'Shopping': {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    ring: 'ring-pink-600/20',
    border: 'border-pink-200',
    hex: '#ec4899',
  },
  'Personal Care': {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    ring: 'ring-teal-600/20',
    border: 'border-teal-200',
    hex: '#14b8a6',
  },
  'Travel': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    ring: 'ring-sky-600/20',
    border: 'border-sky-200',
    hex: '#0284c7',
  },
  'Miscellaneous': {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    ring: 'ring-slate-600/20',
    border: 'border-slate-300',
    hex: '#64748b',
  },
};

export const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  'Food & Dining': Utensils,
  'Housing & Rent': Home,
  'Utilities & Bills': Zap,
  'Transportation': Car,
  'Academics & Books': GraduationCap,
  'Entertainment & Subscriptions': Tv,
  'Health & Fitness': HeartPulse,
  'Shopping': ShoppingBag,
  'Personal Care': Smile,
  'Travel': Plane,
  'Miscellaneous': MoreHorizontal,
};
