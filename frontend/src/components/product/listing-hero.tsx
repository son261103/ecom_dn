import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/motion';
import type { Gender } from '@/lib/types';
import { GENDER_LABEL } from '@/lib/format';
import { type GenderRoute } from './product-list-view';

const BANNERS: Record<GenderRoute, { image: string; tagline: string }> = {
  nam: {
    image:
      'https://res.cloudinary.com/zhloiovg/image/upload/v1791007922/ecom_dn/storefront/listing.nam.jpg',
    tagline: 'Form ôm dáng, chất liệu bền — chuẩn phong cách công sở.',
  },
  nu: {
    image:
      'https://res.cloudinary.com/zhloiovg/image/upload/v1791007922/ecom_dn/storefront/listing.nu.jpg',
    tagline: 'Váy xếp ly, blazer và những món đồ tôn dáng nhẹ nhàng.',
  },
  unisex: {
    image:
      'https://res.cloudinary.com/zhloiovg/image/upload/v1791007924/ecom_dn/storefront/listing.unisex.jpg',
    tagline: 'Những mẫu mặc được cho cả hai, không phân biệt giới tính.',
  },
  featured: {
    image:
      'https://res.cloudinary.com/zhloiovg/image/upload/v1791007924/ecom_dn/storefront/listing.featured.jpg',
    tagline: 'Tuyển chọn những món khách hàng chọn nhiều nhất.',
  },
};

/** Banner đầu các trang danh sách: breadcrumb, tiêu đề và ảnh nền. */
export function ListingHero({
  route,
  title,
  total,
  activeCategory,
}: {
  route: GenderRoute;
  title: string;
  total: number;
  activeCategory?: string;
}) {
  const banner = BANNERS[route];
  const gender: Gender | undefined =
    route === 'nam' ? 'MALE' : route === 'nu' ? 'FEMALE' : undefined;

  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0">
        <Image
          src={banner.image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white">
              {gender ? GENDER_LABEL[gender] : 'Nổi bật'}
            </span>
          </nav>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            {banner.tagline}
          </p>

          <p className="mt-6 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
            {total} sản phẩm
            {activeCategory && ` · ${activeCategory}`}
          </p>
        </Reveal>
      </div>
    </section>
  );
}