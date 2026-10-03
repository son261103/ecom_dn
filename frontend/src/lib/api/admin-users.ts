import { request, toQuery } from './client';
import type { Paginated } from '@/lib/types/shared';
import type { Role } from '@/lib/types/shared';
import type {
  AdminListParams,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserPayload,
} from '@/lib/types/admin';

export interface AdminUserFilters extends AdminListParams {
  role?: Role;
}

export const adminUsersApi = {
  list(token: string, filters: AdminUserFilters = {}) {
    return request<Paginated<AdminUserListItem>>(
      `/admin/users${toQuery({ limit: 50, ...filters })}`,
      { token },
    );
  },

  get(token: string, id: string) {
    return request<AdminUserDetail>(`/admin/users/${id}`, { token });
  },

  create(token: string, payload: AdminUserPayload) {
    return request<AdminUserListItem>('/admin/users', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  update(
    token: string,
    id: string,
    payload: Partial<Pick<AdminUserListItem, 'fullName' | 'phone' | 'role'>>,
  ) {
    return request<AdminUserListItem>(`/admin/users/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    });
  },

  resetPassword(token: string, id: string, password: string) {
    return request<{ reset: boolean }>(`/admin/users/${id}/password`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ password }),
    });
  },

  remove(token: string, id: string) {
    return request<{ deleted: boolean }>(`/admin/users/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};