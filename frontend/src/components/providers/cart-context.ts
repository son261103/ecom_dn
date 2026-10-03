'use client';

import { createContext, useContext } from 'react';
import type { User } from '@/lib/types';

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  thumbnail: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setSession: (token: string | null, user: User | null) => void;
  logout: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}