import type { Metadata } from 'next';
import { ProductListView } from '@/components/product/product-list-view';

export const metadata: Metadata = { title: 'Đồ unisex' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  return <ProductListView route="unisex" searchParams={await searchParams} />;
}
