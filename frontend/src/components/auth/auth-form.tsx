'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/components/providers/cart-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { setSession } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    try {
      const result = isRegister
        ? await authApi.register({
            email: String(form.get('email')),
            password: String(form.get('password')),
            fullName: String(form.get('fullName')),
            phone: String(form.get('phone') ?? '') || undefined,
          })
        : await authApi.login({
            email: String(form.get('email')),
            password: String(form.get('password')),
          });

      setSession(result.accessToken, result.user);
      toast.success(isRegister ? 'Đăng ký thành công' : 'Đăng nhập thành công');
      router.push('/');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không thể xử lý yêu cầu',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <Card className="w-full p-8">
        <div className="mb-8 space-y-2 text-center">
          <div className="mx-auto grid size-10 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
            DN
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRegister
              ? 'Đăng ký để lưu đơn hàng và theo dõi giao hàng.'
              : 'Chào mừng trở lại với DN Fashion.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ban@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={
                isRegister ? 'new-password' : 'current-password'
              }
              placeholder="••••••"
            />
          </div>

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại (không bắt buộc)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0900000000"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? 'Đang xử lý...'
              : isRegister
                ? 'Đăng ký'
                : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? (
            <>
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-medium hover:underline">
                Đăng nhập
              </Link>
            </>
          ) : (
            <>
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </>
          )}
        </p>
      </Card>
    </div>
  );
}