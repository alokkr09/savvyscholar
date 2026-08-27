import { api } from './api';
import { SavingsGoal, CreateGoalPayload, SavingsListResponse } from '../types/savings.types';

export const savingsApi = {
  list: (status?: string): Promise<SavingsListResponse> => {
    return api.get<SavingsListResponse>('/api/savings-goals', { status });
  },

  getById: (id: string): Promise<{ goal: SavingsGoal }> => {
    return api.get<{ goal: SavingsGoal }>(`/api/savings-goals/${id}`);
  },

  create: (data: CreateGoalPayload): Promise<{ goal: SavingsGoal }> => {
    return api.post<{ goal: SavingsGoal }>('/api/savings-goals', data);
  },

  update: (id: string, data: Partial<CreateGoalPayload>): Promise<{ goal: SavingsGoal }> => {
    return api.put<{ goal: SavingsGoal }>(`/api/savings-goals/${id}`, data);
  },

  transact: (
    id: string,
    amount: number,
    type: 'deposit' | 'withdraw'
  ): Promise<{ goal: SavingsGoal }> => {
    return api.patch<{ goal: SavingsGoal }>(`/api/savings-goals/${id}/transaction`, {
      amount,
      type,
    });
  },

  delete: (id: string): Promise<{ deletedId: string; message: string }> => {
    return api.delete<{ deletedId: string; message: string }>(`/api/savings-goals/${id}`);
  },
};
