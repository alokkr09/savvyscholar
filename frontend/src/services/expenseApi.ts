import { api } from './api';
import {
  Expense,
  CreateExpensePayload,
  ExpenseFilterParams,
  ExpenseListResponse,
  CategoryBreakdownItem,
} from '../types/expense.types';

export const expenseApi = {
  list: (filters?: ExpenseFilterParams): Promise<ExpenseListResponse> => {
    return api.get<ExpenseListResponse>('/api/expenses', filters);
  },

  getById: (id: string): Promise<{ expense: Expense }> => {
    return api.get<{ expense: Expense }>(`/api/expenses/${id}`);
  },

  create: (data: CreateExpensePayload): Promise<{ expense: Expense }> => {
    return api.post<{ expense: Expense }>('/api/expenses', data);
  },

  update: (id: string, data: Partial<CreateExpensePayload>): Promise<{ expense: Expense }> => {
    return api.put<{ expense: Expense }>(`/api/expenses/${id}`, data);
  },

  delete: (id: string): Promise<{ deletedId: string; message: string }> => {
    return api.delete<{ deletedId: string; message: string }>(`/api/expenses/${id}`);
  },

  getSummary: (startDate?: string, endDate?: string): Promise<{ breakdown: CategoryBreakdownItem[] }> => {
    return api.get<{ breakdown: CategoryBreakdownItem[] }>('/api/expenses/summary', {
      startDate,
      endDate,
    });
  },
};
