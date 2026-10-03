import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/api';
import type { GenderRoute } from './product-list-view';

const ROUTE_TABS: { route: GenderRoute; label: string }[] = [
  { route: 'nam', label: 'Nam' },
  { route: 'nu', label: 'Nữ' },
  { route: 'unisex', label: 'Unisex' },
  { route: 'featured', label: 'Nổi bật' },
];

export function ProductFilters({
  route,
  categories,
  activeCategory,
}: {
  route: GenderRoute;
  categories: Category[];
  activeCategory?: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Danh mục
        </h2>
        <div className="flex gap-2 lg:flex-col">
          {ROUTE_TABS.map((tab) => (
            <Link
              key={tab.route}
              href={`/${tab.route}`}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                route === tab.route
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Loại sản phẩm
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href={`/${route}`}
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                  !activeCategory && 'bg-muted font-medium',
                )}
              >
                Tất cả
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${route}?category=${category.slug}`}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                    activeCategory === category.slug && 'bg-muted font-medium',
                  )}
                >
                  {category.name}
                  {category._count && (
                    <span className="text-xs text-muted-foreground">
                      {category._count.products}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}