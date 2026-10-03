'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useCart } from '@/components/providers/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/components/admin/motion';

const NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/orders', label: 'Đơn hàng', icon: Receipt },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/images', label: 'Ảnh', icon: ImageIcon },
];

/** Thin bar showing how far down the page is scrolled. */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
      style={{ scaleX: progress }}
    />
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onNavigate?: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId={reduced ? undefined : 'admin-nav-active'}
          className="absolute inset-0 -z-10 rounded-xl bg-sidebar-accent"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <item.icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {active && (
        <motion.span
          initial={reduced ? false : { opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowUpRight className="size-3.5 opacity-60" />
        </motion.span>
      )}
    </Link>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user, logout } = useCart();
  const router = useRouter();

  function isActive(item: (typeof NAV)[number]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-2 pt-1"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
          DN
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-tight">DN Fashion</span>
          <span className="block text-xs text-muted-foreground">
            Khu vực quản trị
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {user && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE_OUT }}
          className="space-y-3 rounded-xl border bg-card/60 p-3"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                router.push('/');
                onNavigate?.();
              }}
            >
              <ArrowUpRight className="size-3.5" />
              Cửa hàng
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                router.push('/');
              }}
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Gate for every /admin page: waits for the session to hydrate, bounces
 * logged-out visitors to /login and customers away. Renders edge to edge —
 * the storefront header and footer live in a sibling route group.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { token, user, hydrated } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || token) return;
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, token, pathname, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setDrawerOpen(false), [pathname]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="grid size-11 animate-pulse place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
            DN
          </span>
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        </motion.div>
      </div>
    );
  }

  if (!token) return null;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30 px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="max-w-md rounded-2xl border bg-card p-8 text-center"
        >
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="mt-4 text-xl font-bold">Không có quyền truy cập</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Khu vực quản trị chỉ dành cho tài khoản quản trị viên.
          </p>
          <Button className="mt-6" onClick={() => router.push('/')}>
            Về cửa hàng
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <ScrollProgress />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="size-5" />
                <span className="sr-only">Đóng menu</span>
              </Button>
              <SidebarContent
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Mở menu</span>
          </Button>
          <span className="font-bold">Quản trị</span>
          <Badge variant="secondary" className="ml-auto">
            Admin
          </Badge>
        </div>

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}