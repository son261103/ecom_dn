'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import {
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Users,
} from 'lucide-react';
import { useCart } from '@/components/providers/cart-context';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/orders', label: 'Đơn hàng', icon: Receipt },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/images', label: 'Ảnh', icon: ImageIcon },
];

/**
 * Gate for every /admin page: waits for the session to hydrate, bounces
 * logged-out visitors to /login and customers to the storefront.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { token, user, hydrated, logout } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!hydrated || token) return;

    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, token, pathname, router]);

  if (!hydrated) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </div>
    );
  }

  if (!token) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
        <p className="mt-2 text-muted-foreground">
          Khu vực quản trị chỉ dành cho tài khoản quản trị viên.
        </p>
        <Button className="mt-6" onClick={() => router.push('/')}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="flex items-center justify-between lg:block">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quản trị
            </p>
            <p className="mt-1 font-semibold">{user?.fullName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Thoát
          </Button>
        </div>

        <Separator className="my-4" />

        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4 hidden lg:block" />
        <Button
          variant="ghost"
          size="sm"
          className="hidden w-full justify-start lg:flex"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Đăng xuất
        </Button>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}