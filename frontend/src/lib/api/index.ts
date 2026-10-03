/**
 * Public API layer — only endpoints a signed-in customer may call.
 *
 *   import { productsApi, categoriesApi } from '@/lib/api';
 *   import type { Product } from '@/lib/types';
 *
 * Admin-only endpoints live in `@/lib/api/admin` and are deliberately kept
 * out of this barrel, so a customer page cannot accidentally call them.
 */
export { ApiError, request } from './client';
export type { RequestOptions } from './client';
export { API_URL } from './config';

export { authApi } from './auth';
export { categoriesApi, productsApi } from './products';
export type { ProductFilters } from './products';
export { ordersApi } from './orders';