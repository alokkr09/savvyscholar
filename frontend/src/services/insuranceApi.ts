import { api } from './api';
import {
  InsurancePolicy,
  CreateInsurancePayload,
  InsuranceListResponse,
} from '../types/insurance.types';

export const insuranceApi = {
  list: (): Promise<InsuranceListResponse> => {
    return api.get<InsuranceListResponse>('/api/insurance');
  },

  getById: (id: string): Promise<{ policy: InsurancePolicy }> => {
    return api.get<{ policy: InsurancePolicy }>(`/api/insurance/${id}`);
  },

  create: (data: CreateInsurancePayload): Promise<{ policy: InsurancePolicy }> => {
    return api.post<{ policy: InsurancePolicy }>('/api/insurance', data);
  },

  update: (id: string, data: Partial<CreateInsurancePayload>): Promise<{ policy: InsurancePolicy }> => {
    return api.put<{ policy: InsurancePolicy }>(`/api/insurance/${id}`, data);
  },

  delete: (id: string): Promise<{ deletedId: string; message: string }> => {
    return api.delete<{ deletedId: string; message: string }>(`/api/insurance/${id}`);
  },
};
