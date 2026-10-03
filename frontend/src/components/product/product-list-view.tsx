import { SearchX } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ProductFilters } from '@/components/product/product-filters';
import { ListingHero } from '@/components/product/listing-hero';
import { Pagination } from '@/components/product/pagination';
import { Stagger, StaggerItem } from '@/components/motion';
import { linkTo } from '@/lib/base-ui';
import { categoriesApi, productsApi } from '@/lib/api';
import type { Gender } from '@/lib/types';

export type GenderRoute = 'nam' | 'nu' | 'unisex' | 'featured';

const ROUTE_GENDER: Record<GenderRoute, Gender | undefined> = {
  nam: 'MALE',
  nu: 'FEMALE',
  unisex: 'UNISEX',
  featured: undefined,
};

const ROUTE_TITLE: Record<GenderRoute, string> = {
  nam: 'Thời trang nam',
  nu: 'Thời trang nữ',
  unisex: 'Đồ unisex',
  featured: 'Sản phẩm nổi bật',
};

const FALLBACK = {
  items: [],
  meta: { total: 0, page: 1, limit: 16, totalPages: 1 },
};

const PAGE_SIZE = 16;

export async function ProductListView({
  route,
  searchParams,
}: {
  route: GenderRoute;
  searchParams: { category?: string; page?: string };
}) {
  const gender = ROUTE_GENDER[route];
  const featuredOnly = route === 'featured';
  const page = Number(searchParams.page ?? 1);
  const basePath = `/${route}`;

  const [result, categories] = await Promise.all([
    productsApi
      .list({
        gender,
        category: searchParams.category,
        featured: featuredOnly,
        page,
        limit: PAGE_SIZE,
      })
      .catch(() => FALLBACK),
    categoriesApi.list(gender).catch(() => []),
  ]);

  const activeCategory = categories.find(
    (c) => c.slug === searchParams.category,
  );

  return (
    <>
      <ListingHero
        route={route}
        title={ROUTE_TITLE[route]}
        total={result.meta.total}
        activeCategory={activeCategory?.name}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-5">
              <ProductFilters
                route={route}
                categories={categories}
                activeCategory={searchParams.category}
              />
            </div>
          </aside>

          <div>
            {result.items.length === 0 ? (
              <Empty className="border py-24">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX />
                  </EmptyMedia>
                  <EmptyTitle>Không tìm thấy sản phẩm nào</EmptyTitle>
                  <EmptyDescription>
                    Thử chọn danh mục khác hoặc xem tất cả sản phẩm trong danh
                    mục này.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" {...linkTo(basePath)}>
                    Xem tất cả
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <>
                <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {result.items.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </Stagger>
                <Pagination
                  page={result.meta.page}
                  totalPages={result.meta.totalPages}
                  basePath={basePath}
                  params={searchParams}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}