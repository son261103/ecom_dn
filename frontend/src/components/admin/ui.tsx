'use client';

import type { ReactNode } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="grid place-items-center py-20">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AdminError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div>
          <p className="font-medium">Không tải được dữ liệu</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </Card>
  );
}

export function AdminEmpty({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ConfirmButton({
  onConfirm,
  children,
  variant = 'destructive',
  size = 'sm',
  pending,
  title,
}: {
  onConfirm: () => void;
  children: ReactNode;
  variant?: 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'icon';
  pending?: boolean;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      title={title}
      disabled={pending}
      onClick={() => {
        if (window.confirm('Bạn có chắc? Hành động này không thể hoàn tác.')) {
          onConfirm();
        }
      }}
    >
      {children}
    </Button>
  );
}