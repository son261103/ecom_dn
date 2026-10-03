import type { Gender, Paginated } from './shared';

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
  /** Always true in public responses; the admin list also returns hidden items. */
  isActive: boolean;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
}

export type ProductListResponse = Paginated<Product>;