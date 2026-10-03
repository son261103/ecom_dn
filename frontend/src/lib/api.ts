import { API_URL } from '@/lib/types';
import type {
  Category,
  Gender,
  Order,
  Paginated,
  Product,
  User,
} from '@/lib/types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & {
    token?: string;
    /** Set for multipart bodies so the browser can add its own boundary. */
    isFormData?: boolean;
  } = {},
): Promise<T> {
  const { token, headers, isFormData, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      Array.isArray(body?.message) && body.message.length > 0
        ? body.message[0]
        : (body?.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại');
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export interface ProductFilters {
  gender?: Gender;
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const productsApi = {
  list(filters: ProductFilters = {}, token?: string) {
    const params = new URLSearchParams();
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.featured) params.set('featured', 'true');
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    return request<Paginated<Product>>(`/products${qs ? `?${qs}` : ''}`, {
      token,
    });
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

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  register(payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  me(token: string) {
    return request<User>('/auth/me', { token });
  },
};

export interface CheckoutPayload {
  items: { variantId: string; quantity: number }[];
  recipientName: string;
  phone: string;
  address: string;
  note?: string;
}

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

export interface UploadedImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadApi = {
  status(token: string) {
    return request<{ configured: boolean }>('/upload/status', { token });
  },

  async image(file: File, token: string) {
    const form = new FormData();
    form.append('file', file);

    // Content-Type must stay unset so the browser adds the multipart boundary.
    return request<UploadedImage>('/upload/image', {
      method: 'POST',
      token,
      body: form,
      isFormData: true,
    });
  },

  fromUrl(url: string, token: string) {
    return request<UploadedImage>('/upload/image-from-url', {
      method: 'POST',
      token,
      body: JSON.stringify({ url }),
    });
  },

  remove(publicId: string, token: string) {
    return request<{ result: string }>(
      `/upload/${encodeURIComponent(publicId)}`,
      { method: 'DELETE', token },
    );
  },
};