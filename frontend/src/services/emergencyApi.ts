import { api } from './api';
import { EmergencyFundData, UpdateEmergencyFundPayload } from '../types/emergency.types';

export const emergencyApi = {
  get: (): Promise<{ fund: EmergencyFundData }> => {
    return api.get<{ fund: EmergencyFundData }>('/api/emergency-fund');
  },

  update: (data: UpdateEmergencyFundPayload): Promise<{ fund: EmergencyFundData }> => {
    return api.put<{ fund: EmergencyFundData }>('/api/emergency-fund', data);
  },

  contribute: (amount: number): Promise<{ fund: EmergencyFundData }> => {
    return api.post<{ fund: EmergencyFundData }>('/api/emergency-fund/contribute', { amount });
  },
};
