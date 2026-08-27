export interface User {
  _id: string;
  name: string;
  email: string;
  currency: string;
  monthlyIncome: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  monthlyIncome?: number;
  currency?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  monthlyIncome?: number;
  currency?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
