import type { Metadata } from 'next';
import { AdminProductsPage } from '@/components/admin/admin-products-page';

export const metadata: Metadata = { title: 'Sản phẩm' };

export default function Page() {
  return <AdminProductsPage />;
}
