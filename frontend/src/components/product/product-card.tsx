'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatPrice, GENDER_LABEL, COLOR_SWATCH, FALLBACK_SWATCH } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const colors = [...new Set(product.variants.map((v) => v.color))];
  // Ảnh thứ hai làm ảnh hover — catalog luôn có ít nhất 2 ảnh sau khi seed.
  const hoverImage = product.images.find(
    (image) => image.url !== product.thumbnail,
  )?.url;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-transparent bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            aria-hidden
            className="object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isFeatured && (
            <Badge className="shadow-sm">Nổi bật</Badge>
          )}
        </div>

        <Badge
          variant="secondary"
          className="absolute right-3 top-3 backdrop-blur"
        >
          {GENDER_LABEL[product.gender]}
        </Badge>

        {/* Thanh "Xem sản phẩm" trượt lên từ dưới lên khi hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground/85 py-2.5 text-center text-xs font-medium text-background backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
          Xem sản phẩm
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 font-medium leading-snug">
          {product.name}
        </h3>
        <p className="font-semibold">{formatPrice(product.basePrice)}</p>

        <div className="mt-auto flex items-center gap-1.5 pt-2">
          {colors.slice(0, 4).map((color) => (
            <span
              key={color}
              title={color}
              aria-label={color}
              className={`size-3.5 rounded-full border border-border/60 ${COLOR_SWATCH[color] ?? FALLBACK_SWATCH}`}
            />
          ))}
          {colors.length > 4 && (
            <span className="text-[11px] text-muted-foreground">
              +{colors.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}