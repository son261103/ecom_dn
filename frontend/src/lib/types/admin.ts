import type { Gender, Role } from './shared';
import type { OrderStatus } from './orders';
import type { Category, Product, ProductVariant } from './products';
import type { User } from './auth';

export interface AdminCategory extends Category {
  _count: { products: number };
  createdAt: string;
}

export interface AdminCategoryPayload {
  name: string;
  slug?: string;
  gender: Gender;
  image?: string;
  sortOrder?: number;
}

export interface AdminProductListItem extends Product {
  _count: { orderItems: number };
}

export interface AdminProductDetail extends AdminProductListItem {
  variants: (ProductVariant & { _count: { orderItems: number } })[];
}

export interface VariantInput {
  color: string;
  size: string;
  stock?: number;
  extraPrice?: number;
}

export interface AdminProductPayload {
  name: string;
  slug?: string;
  description: string;
  brand: string;
  gender: Gender;
  basePrice: number;
  thumbnail: string;
  categoryId: string;
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: VariantInput[];
  images?: { url: string }[];
}

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
}

export interface AdminUserDetail extends AdminUserListItem {
  orders: Pick<
    import('./orders').Order,
    'id' | 'orderNumber' | 'status' | 'total' | 'createdAt'
  >[];
}

export interface AdminUserPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  recipientName: string;
  phone: string;
  address: string;
  note: string | null;
  createdAt: string;
  user: Pick<User, 'id' | 'email' | 'fullName' | 'phone'>;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { id: string; name: string; slug: string; thumbnail: string };
    variant: { id: string; color: string; size: string };
  }[];
}

export interface AdminStats {
  products: { total: number; active: number };
  categories: number;
  users: number;
  orders: {
    total: number;
    pending: number;
    byStatus: Partial<Record<OrderStatus, number>>;
  };
  revenue: number;
  lowStockVariants: number;
  productsByGender: Partial<Record<Gender, number>>;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
}