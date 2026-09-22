import axiosInstance from '../../axios/axiosInstance';
import type { LoginPayload, RegisterPayload, AuthResponse, UserResponse } from './types';

export const AuthAPI = {
  login: (data: LoginPayload): Promise<AuthResponse> =>
    axiosInstance.post('/auth/login', data).then((r) => r.data),

  register: (data: RegisterPayload): Promise<AuthResponse> =>
    axiosInstance.post('/auth/register', data).then((r) => r.data),

  me: (): Promise<UserResponse> =>
    axiosInstance.get('/auth/me').then((r) => r.data),
};
