import { Button } from '@/components/ui/button';
import { linkTo } from '@/lib/base-ui';

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const buildHref = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== 'page') search.set(key, value);
    }
    if (target > 1) search.set('page', String(target));
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        {...linkTo(buildHref(page - 1))}
        disabled={page <= 1}
      >
        Trước
      </Button>
      <span className="px-3 text-sm text-muted-foreground">
        Trang {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        {...linkTo(buildHref(page + 1))}
        disabled={page >= totalPages}
      >
        Sau
      </Button>
    </nav>
  );
}