import { apiClient } from './client';
import { DailyLog } from '../types';

export const logsApi = {
  getAll: async (startDate?: string, endDate?: string): Promise<DailyLog[]> => {
    const response = await apiClient.get<DailyLog[]>('/logs', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  create: async (data: {
    mood?: string;
    moodScore?: number;
    symptoms?: string[];
    sideEffects?: string[];
    notes?: string;
    logDate: string;
  }): Promise<DailyLog> => {
    const response = await apiClient.post<DailyLog>('/logs', data);
    return response.data;
  },
};
