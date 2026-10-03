/**
 * Admin-only API surface, deliberately kept out of `@/lib/api`.
 *
 *   import { adminProductsApi, adminOrdersApi } from '@/lib/api/admin';
 *
 * Every endpoint under /api/admin/* requires a Bearer token whose user has
 * role ADMIN; the backend answers 401 without a token and 403 for a customer.
 */
export { adminCategoriesApi } from './admin-categories';
export type { AdminCategoryFilters } from './admin-categories';

export { adminProductsApi } from './admin-products';
export type { AdminProductFilters, StockMode } from './admin-products';

export { adminOrdersApi } from './admin-orders';
export type { AdminOrderFilters } from './admin-orders';

export { adminUsersApi } from './admin-users';
export type { AdminUserFilters } from './admin-users';

export { adminStatsApi } from './admin-stats';

export { adminImagesApi } from './admin-images';