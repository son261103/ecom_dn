import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { ProductFilters } from '@/components/product/product-filters';
import { Pagination } from '@/components/product/pagination';
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
  meta: { total: 0, page: 1, limit: 12, totalPages: 1 },
};

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
        limit: 12,
      })
      .catch(() => FALLBACK),
    categoriesApi.list(gender).catch(() => []),
  ]);

  const activeCategory = categories.find(
    (c) => c.slug === searchParams.category,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {ROUTE_TITLE[route]}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {result.meta.total} sản phẩm
          {activeCategory && ` · ${activeCategory.name}`}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductFilters
            route={route}
            categories={categories}
            activeCategory={searchParams.category}
          />
        </aside>

        <div>
          {result.items.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed py-24 text-center">
              <p className="font-medium">Không tìm thấy sản phẩm nào</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Thử chọn danh mục khác hoặc xem tất cả sản phẩm.
              </p>
              <Button variant="outline" className="mt-4" {...linkTo(basePath)}>
                Xem tất cả
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
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
  );
}