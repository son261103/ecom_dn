import { request } from './client';
import type { AdminStats } from '@/lib/types/admin';

export const adminStatsApi = {
  summary(token: string) {
    return request<AdminStats>('/admin/stats', { token });
  },
};