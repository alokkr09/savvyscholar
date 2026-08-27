import { api } from './api';
import {
  Investment,
  CreateInvestmentPayload,
  InvestmentListResponse,
} from '../types/investment.types';

export const investmentApi = {
  list: (): Promise<InvestmentListResponse> => {
    return api.get<InvestmentListResponse>('/api/investments');
  },

  getById: (id: string): Promise<{ investment: Investment }> => {
    return api.get<{ investment: Investment }>(`/api/investments/${id}`);
  },

  create: (data: CreateInvestmentPayload): Promise<{ investment: Investment }> => {
    return api.post<{ investment: Investment }>('/api/investments', data);
  },

  update: (id: string, data: Partial<CreateInvestmentPayload>): Promise<{ investment: Investment }> => {
    return api.put<{ investment: Investment }>(`/api/investments/${id}`, data);
  },

  delete: (id: string): Promise<{ deletedId: string; message: string }> => {
    return api.delete<{ deletedId: string; message: string }>(`/api/investments/${id}`);
  },
};
