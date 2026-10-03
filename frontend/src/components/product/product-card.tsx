import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatPrice, GENDER_LABEL } from '@/lib/format';
import type { Product } from '@/lib/api';

export function ProductCard({ product }: { product: Product }) {
  const colors = [...new Set(product.variants.map((v) => v.color))];

  return (
    <Card className="group overflow-hidden border-transparent transition-all hover:border-border hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.isFeatured && (
            <Badge className="absolute left-3 top-3">Nổi bật</Badge>
          )}
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 backdrop-blur"
          >
            {GENDER_LABEL[product.gender]}
          </Badge>
        </div>

        <div className="space-y-2 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="line-clamp-2 font-medium leading-snug">{product.name}</h3>
          <p className="font-semibold">{formatPrice(product.basePrice)}</p>
          <div className="flex gap-1.5 pt-1">
            {colors.slice(0, 4).map((color) => (
              <span
                key={color}
                title={color}
                className="size-3.5 rounded-full border bg-muted"
              />
            ))}
          </div>
        </div>
      </Link>
    </Card>
  );
}