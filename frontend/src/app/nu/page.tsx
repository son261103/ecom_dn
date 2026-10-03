import type { Metadata } from 'next';
import { ProductListView } from '@/components/product/product-list-view';

export const metadata: Metadata = { title: 'Thời trang nữ' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  return <ProductListView route="nu" searchParams={await searchParams} />;
}
