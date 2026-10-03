import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Stagger, StaggerItem, Parallax, HoverLift } from '@/components/motion';
import { formatPrice } from '@/lib/format';
import { linkTo } from '@/lib/base-ui';
import type { Product } from '@/lib/types';

const HERO_IMAGES = {
  main: 'https://res.cloudinary.com/zhloiovg/image/upload/v1791007920/ecom_dn/storefront/HERO_IMAGES.main.jpg',
  top: 'https://res.cloudinary.com/zhloiovg/image/upload/v1791007920/ecom_dn/storefront/HERO_IMAGES.top.jpg',
  bottom: 'https://res.cloudinary.com/zhloiovg/image/upload/v1791007921/ecom_dn/storefront/HERO_IMAGES.bottom.jpg',
};

export function Hero({ spotlight }: { spotlight?: Product }) {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Vệt nền mờ cho chiều sâu, không cần ảnh */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-muted opacity-60 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <Stagger className="max-w-xl">
          <StaggerItem>
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium shadow-sm">
              <Sparkles className="size-3.5 text-amber-500" />
              Bộ sưu tập mới 2026
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Thời trang cho mọi{' '}
              <span className="relative inline-block">
                <span className="relative z-10">phong cách</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1.5 -z-0 h-3 rounded-sm bg-foreground/10 sm:bottom-2 sm:h-4"
                />
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Thiết kế dành riêng cho nam và nữ, chất liệu thoải mái bền lâu và
              giá cả hợp lý. Đổi trả dễ dàng trong 30 ngày — không lý do, không
              rắc rối.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" {...linkTo('/nam')}>
                Mua thời trang nam
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" {...linkTo('/nu')}>
                Mua thời trang nữ
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t pt-8">
              <div>
                <dt className="text-sm text-muted-foreground">Đổi trả</dt>
                <dd className="mt-0.5 text-xl font-bold">30 ngày</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Freeship</dt>
                <dd className="mt-0.5 text-xl font-bold">Từ 500K</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Đổi size</dt>
                <dd className="mt-0.5 text-xl font-bold">Miễn phí</dd>
              </div>
            </dl>
          </StaggerItem>
        </Stagger>

        {/* Collage ảnh có parallax + sản phẩm nổi bật nhúng vào */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-4/5 sm:aspect-3/4 lg:aspect-4/5">
            <Parallax
              offset={40}
              className="absolute inset-x-0 top-0 h-full overflow-hidden rounded-3xl"
            >
              <Image
                src={HERO_IMAGES.main}
                alt="Bộ sưu tập thời trang DN Fashion"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </Parallax>

            <Parallax
              offset={70}
              className="absolute -left-6 top-12 hidden aspect-3/4 w-40 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:block lg:-left-12 lg:w-48"
            >
              <Image
                src={HERO_IMAGES.top}
                alt="Thời trang nữ"
                fill
                priority
                sizes="200px"
                className="object-cover"
              />
            </Parallax>

            <Parallax
              offset={55}
              className="absolute -right-6 bottom-16 hidden aspect-3/4 w-36 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:block lg:-right-10 lg:w-44"
            >
              <Image
                src={HERO_IMAGES.bottom}
                alt="Thời trang nam"
                fill
                priority
                sizes="180px"
                className="object-cover"
              />
            </Parallax>

            {spotlight && (
              <HoverLift className="absolute -bottom-2 right-2 w-56 rounded-2xl border bg-background p-3 shadow-2xl lg:bottom-6 lg:right-4">
                <Link
                  href={`/product/${spotlight.slug}`}
                  className="flex gap-3"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={spotlight.thumbnail}
                      alt={spotlight.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <p className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
                      <Star className="size-3 shrink-0 fill-current" />
                      Được chọn nhiều
                    </p>
                    {/* truncate giữ một dòng: tên dài không làm ô tràn,
                        bị cắt mất dấu "..." ở cuối. */}
                    <p
                      title={spotlight.name}
                      className="mt-0.5 truncate text-sm font-medium leading-snug"
                    >
                      {spotlight.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatPrice(spotlight.basePrice)}
                    </p>
                  </div>
                </Link>
              </HoverLift>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}