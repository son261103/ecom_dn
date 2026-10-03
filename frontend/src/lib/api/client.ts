import { API_URL } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Builds a query string, dropping empty values so `?page=` never appears. */
export function toQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }

  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  token?: string;
  /** Set for multipart bodies so the browser can add its own boundary. */
  isFormData?: boolean;
  headers?: Record<string, string>;
}

/**
 * Single fetch wrapper for the whole app. Domain modules (auth, products,
 * orders, …) build their endpoints on top of this so error handling and the
 * Authorization header stay in one place.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
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