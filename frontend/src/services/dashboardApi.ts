import { api } from './api';
import { DashboardData } from '../types/dashboard.types';

export const dashboardApi = {
  getSummary: (): Promise<DashboardData> => {
    return api.get<DashboardData>('/api/dashboard/summary');
  },
};
