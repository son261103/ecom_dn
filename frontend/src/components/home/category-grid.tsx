import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Section } from '@/components/layout/section';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { GENDER_LABEL } from '@/lib/format';
import type { Category, Gender } from '@/lib/types';

const GENDER_ROUTE: Record<Gender, string> = {
  MALE: '/nam',
  FEMALE: '/nu',
  UNISEX: '/unisex',
};

const GROUPS: { gender: Gender; title: string; note: string }[] = [
  { gender: 'MALE', title: 'Danh mục nam', note: 'Sơ mi, quần tây, bomber' },
  { gender: 'FEMALE', title: 'Danh mục nữ', note: 'Váy xếp ly, blouse, blazer' },
  { gender: 'UNISEX', title: 'Đồ unisex', note: 'Form rộng, mặc cho cả hai' },
];

/**
 * Trước đây 17 danh mục nằm chung một lưới 4 cột nên hàng cuối lủng củng,
 * lệch hàng. Nay chia theo giới tính: mỗi nhóm là một hàng ngang cuộn được
 * nên số mục không chia hết cũng không sinh hàng vơ vọng.
 */
export function CategoryGrid({
  categories,
  fallbackImages,
}: {
  categories: Category[];
  fallbackImages: Partial<Record<Gender, string>>;
}) {
  if (categories.length === 0) return null;

  return (
    <Section className="border-b py-16 lg:py-20">
      <Reveal>
        <div className="mb-12 flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center rounded-full border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Danh mục
          </span>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Mua theo loại sản phẩm
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {categories.length} danh mục được chia theo giới tính — từ áo thun
            cơ bản đến blazer công sở.
          </p>
        </div>
      </Reveal>

      <div className="space-y-12">
        {GROUPS.map((group, index) => {
          const items = categories
            .filter((c) => c.gender === group.gender)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          if (items.length === 0) return null;

          return (
            <Reveal key={group.gender} delay={index * 0.06}>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                    {group.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {group.note}
                  </p>
                </div>
                <Link
                  href={GENDER_ROUTE[group.gender]}
                  className="shrink-0 text-sm font-medium underline-offset-4 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>

              {/* Hàng ngang cuộn được: số mục không cần chia hết theo cột. */}
              <Stagger className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((category) => {
                  const image =
                    category.image ?? fallbackImages[group.gender];
                  return (
                    <StaggerItem
                      key={category.id}
                      className="w-44 shrink-0 snap-start sm:w-52 lg:w-56"
                    >
                      <Link
                        href={`${GENDER_ROUTE[group.gender]}?category=${category.slug}`}
                        className="group relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-2xl bg-muted"
                      >
                        {image && (
                          <Image
                            src={image}
                            alt={category.name}
                            fill
                            sizes="(max-width: 640px) 176px, 224px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        <div className="relative p-3 text-white">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                            {GENDER_LABEL[category.gender]}
                          </p>
                          <h4 className="mt-0.5 text-sm font-semibold leading-tight">
                            {category.name}
                          </h4>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs text-white/70">
                              {category._count?.products ?? 0} sản phẩm
                            </span>
                            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}