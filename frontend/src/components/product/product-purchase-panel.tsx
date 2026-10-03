'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/components/providers/cart-context';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatPrice, GENDER_LABEL } from '@/lib/format';
import type { Product } from '@/lib/api';

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants],
  );
  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size))],
    [product.variants],
  );

  const [color, setColor] = useState(colors[0] ?? '');
  const [size, setSize] = useState(sizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find(
    (v) => v.color === color && v.size === size,
  );
  const price = product.basePrice + (variant?.extraPrice ?? 0);
  const inStock = (variant?.stock ?? 0) > 0;

  function handleAdd() {
    if (!variant || !inStock) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        thumbnail: product.thumbnail,
        color: variant.color,
        size: variant.size,
        unitPrice: price,
      },
      quantity,
    );
    toast.success('Đã thêm vào giỏ hàng', {
      description: `${product.name} · ${variant.color} · ${variant.size}`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-2xl font-semibold">{formatPrice(price)}</p>
      </div>

      <p className="text-sm text-muted-foreground">{product.description}</p>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Màu sắc</h2>
          <span className="text-sm text-muted-foreground">{color}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((option) => (
            <Button
              key={option}
              type="button"
              variant={color === option ? 'default' : 'outline'}
              size="sm"
              onClick={() => setColor(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Kích cỡ</h2>
          <span className="text-sm text-muted-foreground">{size}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((option) => {
            const hasStock = product.variants.some(
              (v) => v.color === color && v.size === option && v.stock > 0,
            );
            return (
              <Button
                key={option}
                type="button"
                variant={size === option ? 'default' : 'outline'}
                size="sm"
                disabled={!hasStock}
                onClick={() => setSize(option)}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Số lượng</h2>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </Button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              setQuantity((q) => Math.min(variant?.stock ?? 1, q + 1))
            }
          >
            +
          </Button>
          {variant && (
            <span
              className={cn(
                'text-sm',
                inStock ? 'text-muted-foreground' : 'text-destructive',
              )}
            >
              {inStock ? `Còn ${variant.stock} sản phẩm` : 'Hết hàng'}
            </span>
          )}
        </div>
      </div>

      <Button size="lg" className="w-full" disabled={!inStock} onClick={handleAdd}>
        {inStock ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded-md border px-2 py-0.5 text-xs font-medium">
          {GENDER_LABEL[product.gender]}
        </span>
        <span>·</span>
        <span>{product.category.name}</span>
      </div>
    </div>
  );
}