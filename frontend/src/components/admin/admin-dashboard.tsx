'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  FolderTree,
  Package,
  Receipt,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { adminStatsApi } from '@/lib/api/admin';
import { formatPrice, GENDER_LABEL } from '@/lib/format';
import { useAdminResource } from '@/components/admin/hooks';
import {
  AdminError,
  AdminHeader,
  AdminLoading,
} from '@/components/admin/ui';
import {
  EASE_OUT,
  HoverLift,
  Reveal,
  Stagger,
  StaggerItem,
} from '@/components/admin/motion';
import { AnimatedNumber } from '@/components/admin/animated-number';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { AdminStats } from '@/lib/types/admin';
import type { Gender, OrderStatus } from '@/lib/types';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
};

const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: 'bg-warning',
  CONFIRMED: 'bg-info',
  SHIPPING: 'bg-primary',
  DELIVERED: 'bg-success',
  CANCELLED: 'bg-muted-foreground',
};

const GENDER_TONE: Record<Gender, string> = {
  MALE: 'bg-info',
  FEMALE: 'bg-destructive',
  UNISEX: 'bg-primary',
};

/** One animated row: label, count, and a proportional bar. */
function StatBar({
  label,
  count,
  max,
  tone,
  index,
}: {
  label: string;
  count: number;
  max: number;
  tone: string;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: EASE_OUT }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${tone}`} />
          {label}
        </span>
        <span className="font-medium tabular-nums">
          <AnimatedNumber value={count} />
        </span>
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 + index * 0.06, duration: 0.6, ease: EASE_OUT }}
        style={{ originX: 0 }}
        className="mt-1.5"
      >
        <Progress
          value={(count / max) * 100}
          className="flex-nowrap [&>[data-slot=progress-indicator]]:bg-primary"
        />
      </motion.div>
    </motion.li>
  );
}

export function AdminDashboard() {
  const { data, loading, error } = useAdminResource<AdminStats>(
    (token) => adminStatsApi.summary(token),
    [],
  );

  const orderRows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.orders.byStatus)
      .map(([status, count]) => ({
        status: status as OrderStatus,
        count: count ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const genderRows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.productsByGender).map(([gender, count]) => ({
      gender: gender as Gender,
      count: count ?? 0,
    }));
  }, [data]);

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;
  if (!data) return null;

  const maxOrder = Math.max(1, ...orderRows.map((r) => r.count));
  const genderTotal = Math.max(
    1,
    genderRows.reduce((sum, r) => sum + r.count, 0),
  );

  const cards = [
    {
      label: 'Doanh thu',
      value: data.revenue,
      format: formatPrice,
      hint: 'Không tính đơn đã huỷ',
      href: '/admin/orders',
      icon: Receipt,
    },
    {
      label: 'Sản phẩm',
      value: data.products.active,
      hint: `${data.products.total} tổng cộng`,
      href: '/admin/products',
      icon: Package,
    },
    {
      label: 'Danh mục',
      value: data.categories,
      hint: 'Đang hoạt động',
      href: '/admin/categories',
      icon: FolderTree,
    },
    {
      label: 'Người dùng',
      value: data.users,
      hint: 'Tài khoản đăng ký',
      href: '/admin/users',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        <AdminHeader
          title="Tổng quan"
          description="Số liệu toàn hệ thống, cập nhật khi tải trang."
        />
      </motion.div>

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StaggerItem key={card.label} className="h-full">
            <HoverLift className="h-full">
              <Link href={card.href} className="block h-full">
                <Card className="group h-full p-5 transition-colors hover:border-primary/40">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <card.icon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums">
                    <AnimatedNumber value={card.value} format={card.format} />
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {card.hint}
                    <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </p>
                </Card>
              </Link>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Đơn hàng theo trạng thái</h2>
              <Link
                href="/admin/orders"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Xem tất cả
              </Link>
            </div>

            {orderRows.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Chưa có đơn.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {orderRows.map((row, index) => (
                  <StatBar
                    key={row.status}
                    label={ORDER_STATUS_LABEL[row.status]}
                    count={row.count}
                    max={maxOrder}
                    tone={ORDER_STATUS_TONE[row.status]}
                    index={index}
                  />
                ))}
              </ul>
            )}

            {data.orders.pending > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.4, ease: EASE_OUT }}
                className="mt-5 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2.5 text-sm text-warning"
              >
                <TrendingUp className="size-4 shrink-0" />
                Có {data.orders.pending} đơn đang chờ xác nhận.
              </motion.div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="h-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Sản phẩm theo giới tính</h2>
              <Link
                href="/admin/products"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Xem tất cả
              </Link>
            </div>

            {genderRows.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Chưa có sản phẩm.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {genderRows.map((row, index) => (
                  <StatBar
                    key={row.gender}
                    label={GENDER_LABEL[row.gender]}
                    count={row.count}
                    max={genderTotal}
                    tone={GENDER_TONE[row.gender]}
                    index={index}
                  />
                ))}
              </ul>
            )}
          </Card>
        </Reveal>
      </div>

      {data.lowStockVariants > 0 && (
        <Reveal>
          <Card className="border-warning/40 bg-warning/5 p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning">
                <TriangleAlert className="size-5" />
              </span>
              <div>
                <p className="font-medium">Tồn kho thấp</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <AnimatedNumber value={data.lowStockVariants} /> biến thể còn
                  5 món hoặc ít hơn.{' '}
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
        </Reveal>
      )}
    </div>
  );
}