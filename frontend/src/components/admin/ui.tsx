'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EASE_OUT, Stagger, StaggerItem } from '@/components/motion';

/** Sticky toolbar so filters stay reachable on long admin lists. */
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
    <div className="sticky top-14 z-20 -mx-4 mb-6 border-b bg-background/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10 lg:pt-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.35, ease: EASE_OUT }}
          >
            {action}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/** Wraps a filter bar so it slides in under the header. */
export function AdminToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container for list rows and cards. */
export function AdminList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Stagger className={className}>{children}</Stagger>
  );
}

export function AdminListItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <StaggerItem className={className} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
      {children}
    </StaggerItem>
  );
}

export function AdminLoading() {
  return (
    <div className="grid place-items-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu…</p>
      </motion.div>
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