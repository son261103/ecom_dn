import { request, toQuery } from './client';
import type { Paginated } from '@/lib/types/shared';
import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminListParams,
} from '@/lib/types/admin';

export interface AdminCategoryFilters extends AdminListParams {
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
}

/** Every call needs the admin's Bearer token. */
export const adminCategoriesApi = {
  list(token: string, filters: AdminCategoryFilters = {}) {
    return request<Paginated<AdminCategory>>(
      `/admin/categories${toQuery({ limit: 100, ...filters })}`,
      { token },
    );
  },

  get(token: string, id: string) {
    return request<AdminCategory>(`/admin/categories/${id}`, { token });
  },

  create(token: string, payload: AdminCategoryPayload) {
    return request<AdminCategory>('/admin/categories', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  update(token: string, id: string, payload: Partial<AdminCategoryPayload>) {
    return request<AdminCategory>(`/admin/categories/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    });
  },

  remove(token: string, id: string) {
    return request<{ deleted: boolean }>(`/admin/categories/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};