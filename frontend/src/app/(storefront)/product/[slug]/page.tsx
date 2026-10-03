import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel';
import { productsApi } from '@/lib/api';
import { GENDER_LABEL } from '@/lib/format';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productsApi.detail(slug).catch(() => null);
  return { title: product?.name ?? 'Sản phẩm' };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productsApi.detail(slug).catch(() => null);

  if (!product) notFound();

  const gallery =
    product.images.length > 0
      ? product.images.map((image) => image.url)
      : [product.thumbnail];

  const genderRoute =
    product.gender === 'MALE' ? 'nam' : product.gender === 'FEMALE' ? 'nu' : 'unisex';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <ChevronRight className="size-4" />
        <Link href={`/${genderRoute}`} className="hover:text-foreground">
          {GENDER_LABEL[product.gender]}
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {gallery.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-3/4 overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={url}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductPurchasePanel product={product} />
        </div>
      </div>
    </div>
  );
}