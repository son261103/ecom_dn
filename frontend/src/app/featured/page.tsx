import type { Metadata } from 'next';
import { ProductListView } from '@/components/product/product-list-view';

export const metadata: Metadata = { title: 'Sản phẩm nổi bật' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  return <ProductListView route="featured" searchParams={await searchParams} />;
}
