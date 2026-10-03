import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PackageCheck, RefreshCw, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';
import { linkTo } from '@/lib/base-ui';

const CATEGORIES = [
  {
    href: '/nam',
    title: 'Thời trang nam',
    description:
      'Áo thun, sơ mi, quần jean và áo khoác cho phong cách hiện đại, tối giản.',
    image:
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80',
  },
  {
    href: '/nu',
    title: 'Thời trang nữ',
    description:
      'Áo blouse, váy xếp ly, áo khoác oversize và áo thun mềm mại.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
  },
];

const PERKS = [
  { icon: Truck, title: 'Giao hàng nhanh', text: 'Freeship cho đơn từ 500K' },
  { icon: RefreshCw, title: 'Đổi trả dễ dàng', text: 'Trong vòng 30 ngày' },
  {
    icon: PackageCheck,
    title: 'Chất lượng cam kết',
    text: 'Đổi mới nếu lỗi sản xuất',
  },
];

export default async function HomePage() {
  const [men, women, featured] = await Promise.all([
    productsApi.list({ gender: 'MALE', limit: 4 }).catch(() => ({ items: [] })),
    productsApi
      .list({ gender: 'FEMALE', limit: 4 })
      .catch(() => ({ items: [] })),
    productsApi.featured().catch(() => []),
  ]);

  return (
    <>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium">
              Bộ sưu tập mới 2026
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Thời trang cho mọi phong cách
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              DN Fashion mang đến những thiết kế dành riêng cho nam và nữ, chất
              liệu thoải mái và giá cả hợp lý. Đổi trả dễ dàng trong 30 ngày.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" {...linkTo('/nam')}>
                Mua thời trang nam
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" {...linkTo('/nu')}>
                Mua thời trang nữ
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-4/3">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                  <p className="mt-1 max-w-sm text-sm text-white/80">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                    Khám phá ngay
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
                <perk.icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{perk.title}</p>
                <p className="text-sm text-muted-foreground">{perk.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductSection title="Sản phẩm nam" href="/nam" products={men.items} />
      <ProductSection title="Sản phẩm nữ" href="/nu" products={women.items} />

      {featured.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Đang được yêu thích
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Những món đồ khách hàng chọn nhiều nhất
                </p>
              </div>
              <Button variant="outline" {...linkTo('/featured')}>
                Xem tất cả
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ProductSection({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <Button variant="outline" {...linkTo(href)}>
            Xem tất cả
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}