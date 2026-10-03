import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: { default: 'Quản trị', template: '%s | Quản trị DN' },
  robots: { index: false, follow: false },
};

/**
 * Admin runs edge to edge — the storefront header and footer belong to the
 * sibling (storefront) route group, so nothing wraps this layout.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
