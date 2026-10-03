export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

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
  status: OrderStatus;
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

export interface CheckoutPayload {
  items: { variantId: string; quantity: number }[];
  recipientName: string;
  phone: string;
  address: string;
  note?: string;
}