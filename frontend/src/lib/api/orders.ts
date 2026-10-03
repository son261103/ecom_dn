import { request } from './client';
import type { CheckoutPayload, Order } from '@/lib/types/orders';

export const ordersApi = {
  create(payload: CheckoutPayload, token: string) {
    return request<Order>('/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  list(token: string) {
    return request<Order[]>('/orders', { token });
  },
};