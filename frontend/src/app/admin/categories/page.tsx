import type { Metadata } from 'next';
import { AdminCategoriesPage } from '@/components/admin/admin-categories-page';

export const metadata: Metadata = { title: 'Danh mục' };

export default function Page() {
  return <AdminCategoriesPage />;
}
