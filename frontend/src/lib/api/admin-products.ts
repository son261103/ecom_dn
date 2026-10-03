import { request, toQuery } from './client';
import type { Paginated } from '@/lib/types/shared';
import type {
  AdminListParams,
  AdminProductDetail,
  AdminProductListItem,
  AdminProductPayload,
} from '@/lib/types/admin';

export interface AdminProductFilters extends AdminListParams {
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  categoryId?: string;
  isActive?: 'true' | 'false';
  isFeatured?: 'true' | 'false';
}

export type StockMode = 'SET' | 'INCREASE' | 'DECREASE';

export const adminProductsApi = {
  list(token: string, filters: AdminProductFilters = {}) {
    return request<Paginated<AdminProductListItem>>(
      `/admin/products${toQuery({ limit: 50, ...filters })}`,
      { token },
    );
  },

  get(token: string, id: string) {
    return request<AdminProductDetail>(`/admin/products/${id}`, { token });
  },

  create(token: string, payload: AdminProductPayload) {
    return request<AdminProductListItem>('/admin/products', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  update(token: string, id: string, payload: Partial<AdminProductPayload>) {
    return request<AdminProductListItem>(`/admin/products/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    });
  },

  adjustStock(token: string, variantId: string, quantity: number, mode: StockMode) {
    return request<{ stock: number }>(
      `/admin/products/variants/${variantId}/stock`,
      { method: 'PATCH', token, body: JSON.stringify({ quantity, mode }) },
    );
  },

  /** Soft-deletes when the product is referenced by an order. */
  remove(token: string, id: string) {
    return request<{ deleted: boolean; message?: string }>(
      `/admin/products/${id}`,
      { method: 'DELETE', token },
    );
  },
};