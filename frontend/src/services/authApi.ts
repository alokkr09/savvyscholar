import { api } from './api';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfilePayload,
  ChangePasswordPayload,
  User,
} from '../types/auth.types';

export const authApi = {
  register: (credentials: RegisterCredentials): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/register', credentials);
  },

  login: (credentials: LoginCredentials): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/login', credentials);
  },

  getMe: (): Promise<{ user: User }> => {
    return api.get<{ user: User }>('/api/auth/me');
  },

  updateProfile: (data: UpdateProfilePayload): Promise<{ user: User }> => {
    return api.put<{ user: User }>('/api/user/profile', data);
  },

  changePassword: (data: ChangePasswordPayload): Promise<{ message: string }> => {
    return api.put<{ message: string }>('/api/user/change-password', data);
  },
};
