export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005/api';

export type Gender = 'MALE' | 'FEMALE' | 'UNISEX';
export type Role = 'CUSTOMER' | 'ADMIN';

export interface Paginated<T> {
  items: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}