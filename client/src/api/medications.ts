import { apiClient } from './client';
import { Medication, MedicationLog } from '../types';

export const medicationsApi = {
  getAll: async (): Promise<Medication[]> => {
    const response = await apiClient.get<Medication[]>('/medications');
    return response.data;
  },

  create: async (data: {
    name: string;
    dosage: string;
    frequency: string;
    timeOfDay: string;
    prescribedBy?: string;
  }): Promise<Medication> => {
    const response = await apiClient.post<Medication>('/medications', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      name: string;
      dosage: string;
      frequency: string;
      timeOfDay: string;
    }
  ): Promise<Medication> => {
    const response = await apiClient.put<Medication>(`/medications/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/medications/${id}`);
  },

  logMedication: async (medicationId: string, taken: boolean, logDate: string): Promise<MedicationLog> => {
    const response = await apiClient.post<MedicationLog>('/medications/log', {
      medicationId,
      taken,
      logDate,
    });
    return response.data;
  },

  getLogs: async (startDate?: string, endDate?: string): Promise<MedicationLog[]> => {
    const response = await apiClient.get<MedicationLog[]>('/medications/logs', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
