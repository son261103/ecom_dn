'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { FolderTree, Package, Receipt, TriangleAlert, Users } from 'lucide-react';
import { adminStatsApi } from '@/lib/api/admin';
import { formatPrice, GENDER_LABEL } from '@/lib/format';
import { useAdminResource } from '@/components/admin/hooks';
import {
  AdminError,
  AdminHeader,
  AdminLoading,
} from '@/components/admin/ui';
import { Card } from '@/components/ui/card';
import type { AdminStats } from '@/lib/types/admin';
import type { Gender, OrderStatus } from '@/lib/types';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
};

export function AdminDashboard() {
  const { data, loading, error } =
    useAdminResource<AdminStats>((token) => adminStatsApi.summary(token), []);

  const genderRows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.productsByGender).map(([gender, count]) => ({
      gender: gender as Gender,
      count: count ?? 0,
    }));
  }, [data]);

  const statusRows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.orders.byStatus).map(([status, count]) => ({
      status: status as OrderStatus,
      count: count ?? 0,
    }));
  }, [data]);

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;
  if (!data) return null;

  const cards = [
    {
      label: 'Doanh thu',
      value: formatPrice(data.revenue),
      hint: 'Không tính đơn đã huỷ',
      href: '/admin/orders',
      icon: Receipt,
    },
    {
      label: 'Sản phẩm',
      value: String(data.products.active),
      hint: `${data.products.total} tổng cộng`,
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'Danh mục',
      value: String(data.categories),
      hint: 'Đang hoạt động',
      href: '/admin/categories',
      icon: FolderTree,
    },
    {
      label: 'Người dùng',
      value: String(data.users),
      hint: 'Tài khoản đăng ký',
      href: '/admin/users',
      icon: Users,
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Tổng quan"
        description="Số liệu toàn hệ thống, cập nhật khi tải trang."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="p-5 transition-colors hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <card.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Đơn hàng theo trạng thái</h2>
          {statusRows.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Chưa có đơn.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {statusRows.map((row) => (
                <li
                  key={row.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{ORDER_STATUS_LABEL[row.status]}</span>
                  <span className="font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
          {data.orders.pending > 0 && (
            <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
              Có {data.orders.pending} đơn đang chờ xác nhận.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Sản phẩm theo giới tính</h2>
          {genderRows.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Chưa có sản phẩm.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {genderRows.map((row) => (
                <li
                  key={row.gender}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{GENDER_LABEL[row.gender]}</span>
                  <span className="font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {data.lowStockVariants > 0 && (
        <Card className="mt-4 border-warning/40 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <p className="font-medium">Tồn kho thấp</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.lowStockVariants} biến thể còn 5 món hoặc ít hơn.{' '}
                <Link
                  href="/admin/products"
                  className="font-medium underline underline-offset-4"
                >
                  Kiểm tra ngay
                </Link>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}