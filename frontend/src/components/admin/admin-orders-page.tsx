'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminOrdersApi } from '@/lib/api/admin';
import { formatPrice } from '@/lib/format';
import { useAdminAction, useAdminResource } from '@/components/admin/hooks';
import {
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminList,
  AdminListItem,
  AdminLoading,
  AdminToolbar,
  ConfirmButton,
} from '@/components/admin/ui';
import { HoverLift } from '@/components/admin/motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminOrderListItem, OrderStatus } from '@/lib/types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
};

/** Statuses reachable from each state, mirroring the backend's rules. */
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function AdminOrdersPage() {
  const { run, pending } = useAdminAction();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | OrderStatus>('all');

  const { data, loading, error, reload } = useAdminResource(
    (token) =>
      adminOrdersApi.list(token, {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
      }),
    [search, status],
  );

  async function handleStatusChange(order: AdminOrderListItem, next: OrderStatus) {
    await run((token) => adminOrdersApi.updateStatus(token, order.id, next), {
      success: `Đã chuyển sang "${STATUS_LABEL[next]}"`,
      onDone: reload,
    });
  }

  async function handleDelete(order: AdminOrderListItem) {
    await run((token) => adminOrdersApi.remove(token, order.id), {
      success: 'Đã xoá đơn hàng',
      onDone: reload,
    });
  }

  return (
    <div>
      <AdminHeader
        title="Đơn hàng"
        description={`${data?.meta.total ?? 0} đơn`}
      />

      <AdminToolbar className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn, tên, SĐT…"
          className="max-w-xs"
        />
        <Select
          items={{ all: 'Mọi trạng thái', ...STATUS_LABEL }}
          value={status}
          onValueChange={(v) => setStatus(v as 'all' | OrderStatus)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi trạng thái</SelectItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbar>

      {loading && <AdminLoading />}
      {error && <AdminError message={error} />}

      {!loading && !error && (
        <AdminList className="space-y-3">
          {data && data.items.length > 0 ? (
            data.items.map((order) => (
              <AdminListItem key={order.id}>
                <HoverLift>
              <Card className="p-4 transition-colors hover:border-primary/40">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">#{order.orderNumber}</p>
                      <Badge
                        variant={order.status === 'CANCELLED' ? 'outline' : 'secondary'}
                      >
                        {STATUS_LABEL[order.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.recipientName} · {order.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.address}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.user.email} ·{' '}
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    {order.shippingFee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        + {formatPrice(order.shippingFee)} phí giao
                      </p>
                    )}
                  </div>
                </div>

                <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span className="relative size-8 shrink-0 overflow-hidden rounded bg-muted">
                        <Image
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                          unoptimized
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.product.name}
                        <span className="text-muted-foreground">
                          {' '}
                          · {item.variant.color} / {item.variant.size} ×{' '}
                          {item.quantity}
                        </span>
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                  {NEXT_STATUS[order.status].length > 0 ? (
                    <>
                      <Select
                        value={null}
                        onValueChange={(v) =>
                          v && handleStatusChange(order, v as OrderStatus)
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Đổi trạng thái…" />
                        </SelectTrigger>
                        <SelectContent>
                          {NEXT_STATUS[order.status].map((next) => (
                            <SelectItem key={next} value={next}>
                              {STATUS_LABEL[next]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {NEXT_STATUS[order.status].includes('CANCELLED') && (
                        <p className="text-xs text-muted-foreground">
                          Huỷ đơn sẽ trả lại tồn kho.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Đơn đã ở trạng thái cuối, không thể chuyển tiếp.
                    </p>
                  )}

                  {order.status === 'CANCELLED' && (
                    <ConfirmButton
                      pending={pending}
                      variant="outline"
                      onConfirm={() => handleDelete(order)}
                    >
                      <Trash2 className="size-4" />
                      Xoá đơn
                    </ConfirmButton>
                  )}
                </div>
              </Card>
                </HoverLift>
              </AdminListItem>
            ))
          ) : (
            <AdminEmpty message="Không có đơn hàng nào khớp bộ lọc." />
          )}
        </AdminList>
      )}
    </div>
  );
}