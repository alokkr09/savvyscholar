import { Expense } from './expense.types';

export interface SmartInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
    currency: string;
    monthlyIncome: number;
  };
  currentMonth: {
    key: string;
    monthName: string;
    totalSpent: number;
    transactionCount: number;
    netSavings: number;
    savingsRate: number;
  };
  budgets: {
    totalAllocated: number;
    utilizationPercentage: number;
    activeCount: number;
  };
  investments: {
    totalInvested: number;
    totalCurrentValue: number;
    gainLoss: number;
    returnRate: number;
    holdingCount: number;
  };
  emergencyFund: {
    currentAmount: number;
    targetAmount: number;
    runwayMonths: number;
    progressPercentage: number;
  };
  recentTransactions: Expense[];
  savingsGoals: Array<{
    _id: string;
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    percentage: number;
  }>;
  categorySpending: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  smartInsights: SmartInsight[];
}
