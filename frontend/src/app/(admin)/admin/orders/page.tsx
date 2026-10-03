import type { Metadata } from 'next';
import { AdminOrdersPage } from '@/components/admin/admin-orders-page';

export const metadata: Metadata = { title: 'Đơn hàng' };

export default function Page() {
  return <AdminOrdersPage />;
}
