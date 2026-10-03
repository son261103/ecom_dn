'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';
import { useCart } from '@/components/providers/cart-context';

interface UseAdminResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

function errorText(caught: unknown): string {
  if (caught instanceof ApiError || caught instanceof Error) {
    return caught.message;
  }
  return 'Thao tác thất bại';
}

/**
 * Fetches an admin resource once the session exists, refetching when `deps`
 * change.
 *
 * The loader is kept in a ref rather than a dependency: callers pass an inline
 * arrow function, so depending on its identity would change `reload` on every
 * render and refetch forever.
 */
export function useAdminResource<T>(
  load: (token: string) => Promise<T>,
  deps: readonly unknown[],
): UseAdminResource<T> {
  const { token, hydrated } = useCart();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const reload = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      setData(await loadRef.current(token));
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!hydrated || !token) return;
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token, reload, ...deps]);

  return { data, loading, error, reload };
}

export interface AdminActionOptions {
  success?: string;
  onDone?: () => void | Promise<void>;
}

/**
 * Wraps a mutating admin call with a pending flag and an error toast, then
 * refreshes the list. Returns null instead of throwing so callers can bail out.
 */
export function useAdminAction() {
  const { token } = useCart();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <TResult,>(
      action: (token: string) => Promise<TResult>,
      options: AdminActionOptions = {},
    ): Promise<TResult | null> => {
      if (!token) {
        toast.error('Phiên đăng nhập đã hết, vui lòng đăng nhập lại.');
        return null;
      }

      setPending(true);
      try {
        const result = await action(token);
        if (options.success) toast.success(options.success);
        await options.onDone?.();
        return result;
      } catch (caught) {
        toast.error(errorText(caught));
        return null;
      } finally {
        setPending(false);
      }
    },
    [token],
  );

  return { run, pending, token };
}