'use client';

import {
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { User } from '@/lib/types';
import { CartContext, type CartItem } from './cart-context';

const CART_KEY = 'dn_cart';
const TOKEN_KEY = 'dn_token';
const USER_KEY = 'dn_user';

/**
 * `useSyncExternalStore` compares snapshots with `Object.is`, so a read must
 * return the same reference until storage actually changes. Parsing JSON on
 * every call would hand back a fresh array each time and re-render forever,
 * so each store remembers the raw string it last parsed.
 */
function createLocalStore<T>(key: string, fallback: T) {
  let raw: string | null = null;
  let parsed: T = fallback;
  let primed = false;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      window.addEventListener('storage', listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
      };
    },
    read(): T {
      const next = window.localStorage.getItem(key);
      if (!primed || next !== raw) {
        raw = next;
        parsed = next ? (JSON.parse(next) as T) : fallback;
        primed = true;
      }
      return parsed;
    },
    readHydrated() {
      hydrated = true;
      return true;
    },
    serverHydrated() {
      return hydrated;
    },
    write(value: T | null) {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
      primed = false;
      emit();
    },
  };
}

const itemsStore = createLocalStore<CartItem[]>(CART_KEY, []);
const userStore = createLocalStore<User | null>(USER_KEY, null);
const tokenStore = createLocalStore<string | null>(TOKEN_KEY, null);
const flagStore = createLocalStore<boolean>('__hydrated', false);

/**
 * React compares server snapshots with `Object.is`, so these must be stable
 * references — an inline `() => []` would produce a new array every render and
 * warn about an infinite loop.
 */
const SERVER_ITEMS: CartItem[] = [];
const SERVER_USER: User | null = null;
const SERVER_TOKEN: string | null = null;

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    itemsStore.subscribe,
    itemsStore.read,
    () => SERVER_ITEMS,
  );
  const user = useSyncExternalStore(
    userStore.subscribe,
    userStore.read,
    () => SERVER_USER,
  );
  const token = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.read,
    () => SERVER_TOKEN,
  );
  const hydrated = useSyncExternalStore(
    flagStore.subscribe,
    flagStore.readHydrated,
    flagStore.serverHydrated,
  );

  const value = useMemo(
    () => ({
      items,
      token,
      user,
      hydrated,
      addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
        const existing = items.find((i) => i.variantId === item.variantId);
        itemsStore.write(
          existing
            ? items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              )
            : [...items, { ...item, quantity }],
        );
      },
      removeItem(variantId: string) {
        itemsStore.write(items.filter((i) => i.variantId !== variantId));
      },
      setQuantity(variantId: string, quantity: number) {
        if (quantity < 1) {
          itemsStore.write(items.filter((i) => i.variantId !== variantId));
          return;
        }
        itemsStore.write(
          items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        );
      },
      clear() {
        itemsStore.write([]);
      },
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      setSession(nextToken: string | null, nextUser: User | null) {
        tokenStore.write(nextToken);
        userStore.write(nextUser);
      },
      logout() {
        tokenStore.write(null);
        userStore.write(null);
      },
    }),
    [items, token, user, hydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}