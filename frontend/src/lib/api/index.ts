/**
 * Domain-based API layer. Components import from here so call sites stay short
 * and each domain can grow without touching shared code:
 *
 *   import { productsApi, categoriesApi } from '@/lib/api';
 *   import type { Product } from '@/lib/api';
 */
export { ApiError, request } from './client';
export type { RequestOptions } from './client';

export { authApi } from './auth';
export type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from './auth.types';

export { categoriesApi, productsApi } from './products';
export type { ProductFilters } from './products';
export type {
  Category,
  Product,
  ProductImage,
  ProductListResponse,
  ProductVariant,
} from './products.types';

export { ordersApi } from './orders';
export type {
  CheckoutPayload,
  Order,
  OrderItem,
  OrderStatus,
} from './orders.types';

export { uploadApi } from './upload';
export type { UploadedImage } from './upload.types';

export type { Gender, Paginated, Role } from './shared';