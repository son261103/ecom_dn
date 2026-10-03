'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/components/providers/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ordersApi } from '@/lib/api';
import { linkTo } from '@/lib/base-ui';

export function CheckoutForm() {
  const { items, token, user, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="space-y-3 rounded-xl border p-6 text-center">
        <p className="font-medium">Đăng nhập để thanh toán</p>
        <p className="text-sm text-muted-foreground">
          Bạn cần tài khoản để lưu đơn hàng và theo dõi giao hàng.
        </p>
        <Button className="w-full" {...linkTo('/login')}>
          Đăng nhập
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    try {
      const order = await ordersApi.create(
        {
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          recipientName: String(form.get('recipientName')),
          phone: String(form.get('phone')),
          address: String(form.get('address')),
          note: String(form.get('note') ?? '') || undefined,
        },
        token as string,
      );

      clear();
      toast.success('Đặt hàng thành công', {
        description: `Mã đơn ${order.orderNumber}`,
      });
      router.push('/account/orders');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Đặt hàng thất bại',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-6">
      <h2 className="font-semibold">Thông tin giao hàng</h2>

      <div className="space-y-2">
        <Label htmlFor="recipientName">Họ và tên</Label>
        <Input
          id="recipientName"
          name="recipientName"
          required
          defaultValue={user?.fullName ?? ''}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          name="phone"
          required
          type="tel"
          defaultValue={user?.phone ?? ''}
          placeholder="0900000000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Textarea
          id="address"
          name="address"
          required
          rows={3}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
        <Textarea
          id="note"
          name="note"
          rows={2}
          placeholder="Lưu ý cho đơn vị giao hàng"
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
      </Button>
    </form>
  );
}