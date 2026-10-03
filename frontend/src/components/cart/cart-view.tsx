'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/providers/cart-context';
import { CheckoutForm } from '@/components/cart/checkout-form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/format';
import { linkTo } from '@/lib/base-ui';

const SHIPPING_FEE = 30000;

export function CartView() {
  const { items, setQuantity, removeItem, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="mt-2 text-muted-foreground">
          Bạn chưa thêm sản phẩm nào. Hãy khám phá các bộ sưu tập của chúng tôi.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button {...linkTo('/nam')}>Thời trang nam</Button>
          <Button variant="outline" {...linkTo('/nu')}>
            Thời trang nữ
          </Button>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 500000 ? 0 : SHIPPING_FEE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Giỏ hàng <span className="text-muted-foreground">({totalItems})</span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 rounded-xl border p-4"
            >
              <Link
                href={`/product/${item.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={item.thumbnail}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {item.color} · Size {item.size}
                </p>
                <p className="font-medium">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>

                <div className="mt-auto flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-1 rounded-lg border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity - 1)
                      }
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity + 1)
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.variantId)}
                  >
                    <Trash2 className="size-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-3 rounded-xl border p-6">
            <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
            </div>
            {subtotal < 500000 && (
              <p className="text-xs text-muted-foreground">
                Mua thêm {formatPrice(500000 - subtotal)} để được freeship.
              </p>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Tổng cộng</span>
              <span>{formatPrice(subtotal + shipping)}</span>
            </div>
          </div>

          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}