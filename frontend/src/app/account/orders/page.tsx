import type { Metadata } from 'next';
import { AccountView } from '@/components/account/account-view';

export const metadata: Metadata = { title: 'Đơn hàng' };

export default function OrdersPage() {
  return <AccountView />;
}
