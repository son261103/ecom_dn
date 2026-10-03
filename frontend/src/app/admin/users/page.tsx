import type { Metadata } from 'next';
import { AdminUsersPage } from '@/components/admin/admin-users-page';

export const metadata: Metadata = { title: 'Người dùng' };

export default function Page() {
  return <AdminUsersPage />;
}
