export type ExpenseCategory =
  | 'Food & Dining'
  | 'Housing & Rent'
  | 'Utilities & Bills'
  | 'Transportation'
  | 'Academics & Books'
  | 'Entertainment & Subscriptions'
  | 'Health & Fitness'
  | 'Shopping'
  | 'Personal Care'
  | 'Travel'
  | 'Miscellaneous';

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Digital Wallet'
  | 'Other';

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  title: string;
  category: ExpenseCategory;
  description?: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpensePayload {
  title: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date?: string;
  paymentMethod?: PaymentMethod;
  tags?: string[];
}

export interface ExpenseFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    totalSpent: number;
    count: number;
  };
}

export interface CategoryBreakdownItem {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}
