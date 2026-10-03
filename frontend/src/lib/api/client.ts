import { API_URL } from './shared';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
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