import { apiClient } from './client';
import { Stats } from '../types';

export const reportsApi = {
  getStats: async (startDate?: string, endDate?: string): Promise<Stats> => {
    const response = await apiClient.get<Stats>('/reports/stats', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  share: async (dateRange: string): Promise<{ shareUrl: string; expiresAt: string }> => {
    const response = await apiClient.post('/reports/share', { dateRange });
    return response.data;
  },
};
