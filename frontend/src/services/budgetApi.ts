import { api } from './api';
import { Budget, CreateBudgetPayload, BudgetListResponse } from '../types/budget.types';

export const budgetApi = {
  list: (month?: string): Promise<BudgetListResponse> => {
    return api.get<BudgetListResponse>('/api/budgets', { month });
  },

  upsert: (data: CreateBudgetPayload): Promise<{ budget: Budget }> => {
    return api.post<{ budget: Budget }>('/api/budgets', data);
  },

  update: (
    id: string,
    data: { amount?: number; alertThreshold?: number }
  ): Promise<{ budget: Budget }> => {
    return api.put<{ budget: Budget }>(`/api/budgets/${id}`, data);
  },

  delete: (id: string): Promise<{ deletedId: string; message: string }> => {
    return api.delete<{ deletedId: string; message: string }>(`/api/budgets/${id}`);
  },
};
