import { ExpenseCategory } from './expense.types';

export interface Budget {
  _id: string;
  category: ExpenseCategory;
  month: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  alertThreshold: number;
  isExceeded: boolean;
  isNearThreshold: boolean;
  transactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetPayload {
  category: ExpenseCategory;
  amount: number;
  month?: string;
  alertThreshold?: number;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  budgetCount: number;
  exceededCount: number;
}

export interface BudgetListResponse {
  month: string;
  budgets: Budget[];
  summary: BudgetSummary;
}
