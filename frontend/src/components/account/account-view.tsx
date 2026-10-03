'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/providers/cart-context';
import { linkTo } from '@/lib/base-ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/format';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/lib/api';

const STATUS_LABEL: Record<Order['status'], string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export function AccountView() {
  const { token, user, logout, hydrated } = useCart();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!token) return;
    ordersApi
      .list(token)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [token]);

  useEffect(() => {
    if (hydrated && !token) router.replace('/login');
  }, [hydrated, token, router]);

  if (!token || !user) return null;

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Xin chào, {user.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>

      <Tabs defaultValue="orders" className="mt-10">
        <TabsList>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6 space-y-4">
          {orders === null && <p className="text-sm text-muted-foreground">Đang tải...</p>}
          {orders?.length === 0 && (
            <Card className="p-10 text-center">
              <p className="font-medium">Bạn chưa có đơn hàng nào</p>
              <Button className="mt-4" {...linkTo('/featured')}>
                Khám phá sản phẩm
              </Button>
            </Card>
          )}
          {orders?.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">#{order.orderNumber}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} · {item.variant.color} ·{' '}
                      {item.variant.size} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="space-y-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Họ và tên</p>
              <p className="font-medium">{user.fullName}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Loại tài khoản</p>
              <p className="font-medium">
                {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}