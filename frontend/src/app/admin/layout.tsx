import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: { default: 'Quản trị', template: '%s | Quản trị DN' },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
