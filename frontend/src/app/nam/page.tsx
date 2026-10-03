import type { Metadata } from 'next';
import { ProductListView } from '@/components/product/product-list-view';

export const metadata: Metadata = { title: 'Thời trang nam' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  return <ProductListView route="nam" searchParams={await searchParams} />;
}
