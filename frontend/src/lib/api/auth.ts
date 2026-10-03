import { request } from './client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from './auth.types';

export const authApi = {
  register(payload: RegisterPayload) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  me(token: string) {
    return request<User>('/auth/me', { token });
  },
};