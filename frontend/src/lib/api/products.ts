import { request } from './client';
import type { Gender } from './shared';
import type {
  Category,
  Product,
  ProductListResponse,
} from './products.types';

export interface ProductFilters {
  gender?: Gender;
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const productsApi = {
  list(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.featured) params.set('featured', 'true');
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    return request<ProductListResponse>(
      `/products${qs ? `?${qs}` : ''}`,
    );
  },

  featured() {
    return request<Product[]>('/products/featured');
  },

  detail(slug: string) {
    return request<Product>(`/products/${slug}`);
  },
};

export const categoriesApi = {
  list(gender?: Gender) {
    const qs = gender ? `?gender=${gender}` : '';
    return request<Category[]>(`/categories${qs}`);
  },
};