import type { RequestUser } from '../auth/types.js';

export type { RequestUser as AdminUser };

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate(
  page: number,
  limit: number,
  total: number,
): PaginatedMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Builds the `where` clause shared by the admin list endpoints: a trimmed
 * case-insensitive match across the given fields.
 */
export function searchWhere(
  term: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  const trimmed = term?.trim();
  if (!trimmed) return undefined;

  return {
    OR: fields.map((field) => ({
      [field]: { contains: trimmed, mode: 'insensitive' },
    })),
  };
}