import { apiClient } from './client';
import { AuthResponse } from '../types';

export const authApi = {
  login: async (username: string, password: string, userType: 'patient' | 'provider'): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      username,
      password,
      userType,
    });
    return response.data;
  },

  signup: async (
    username: string,
    email: string,
    password: string,
    userType: 'patient' | 'provider'
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', {
      username,
      email,
      password,
      userType,
    });
    return response.data;
  },
};
