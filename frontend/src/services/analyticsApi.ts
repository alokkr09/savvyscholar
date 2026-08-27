import { api } from './api';
import { AnalyticsData } from '../types/analytics.types';

export const analyticsApi = {
  getOverview: (months = 6): Promise<AnalyticsData> => {
    return api.get<AnalyticsData>('/api/analytics/overview', { months });
  },
};
