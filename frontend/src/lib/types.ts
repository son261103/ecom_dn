export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005/api';

export type Gender = 'MALE' | 'FEMALE' | 'UNISEX';

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: Gender;
  image: string | null;
  sortOrder: number;
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
  extraPrice: number;
}

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  gender: Gender;
  basePrice: number;
  thumbnail: string;
  isFeatured: boolean;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface Paginated<T> {
  items: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; slug: string; thumbnail: string };
  variant: { color: string; size: string };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shippingFee: number;
  total: number;
  recipientName: string;
  phone: string;
  address: string;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}