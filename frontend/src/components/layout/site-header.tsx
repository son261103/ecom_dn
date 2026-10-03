'use client';

import { Menu, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/components/providers/cart-context';
import { linkTo } from '@/lib/base-ui';

const NAV = [
  { href: '/nam', label: 'Nam' },
  { href: '/nu', label: 'Nữ' },
  { href: '/unisex', label: 'Unisex' },
  { href: '/featured', label: 'Nổi bật' },
];

export function SiteHeader() {
  const { totalItems, user } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Mở menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-1 p-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            DN
          </span>
          <span className="hidden sm:inline">DN Fashion</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  active ? 'bg-muted text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            {...linkTo(user ? '/account' : '/login')}
          >
            <User className="size-5" />
            <span className="sr-only">Tài khoản</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            {...linkTo('/cart')}
          >
            <ShoppingBag className="size-5" />
            <span className="sr-only">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="absolute right-1 top-1 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}