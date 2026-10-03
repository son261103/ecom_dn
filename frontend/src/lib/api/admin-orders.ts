import { request, toQuery } from './client';
import type { Paginated } from '@/lib/types/shared';
import type { OrderStatus } from '@/lib/types/orders';
import type {
  AdminListParams,
  AdminOrderListItem,
} from '@/lib/types/admin';

export interface AdminOrderFilters extends AdminListParams {
  status?: OrderStatus;
  userId?: string;
}

export const adminOrdersApi = {
  list(token: string, filters: AdminOrderFilters = {}) {
    return request<Paginated<AdminOrderListItem>>(
      `/admin/orders${toQuery({ limit: 50, ...filters })}`,
      { token },
    );
  },

  get(token: string, id: string) {
    return request<AdminOrderListItem>(`/admin/orders/${id}`, { token });
  },

  /** Statuses the order can legally move to from where it is now. */
  transitions(token: string, id: string) {
    return request<{ current: OrderStatus; allowed: OrderStatus[] }>(
      `/admin/orders/${id}/transitions`,
      { token },
    );
  },

  updateStatus(token: string, id: string, status: OrderStatus) {
    return request<AdminOrderListItem>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
  },

  update(
    token: string,
    id: string,
    payload: Partial<
      Pick<AdminOrderListItem, 'recipientName' | 'phone' | 'address' | 'note'>
    >,
  ) {
    return request<AdminOrderListItem>(`/admin/orders/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    });
  },

  remove(token: string, id: string) {
    return request<{ deleted: boolean }>(`/admin/orders/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};