import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Container + heading dùng chung cho các section của storefront. Trước đây
 * recipe `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` bị lặp ở mọi page; gom về
 * đây để đổi độ rộng hay padding chỉ sửa một chỗ.
 */
export function Section({
  children,
  className,
  containerClassName,
  id,
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={className}>
      <div
        className={cn(
          'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Header của section: eyebrow trong chip bo tròn, tiêu đề lớn, mô tả giới
 * hạn bề ngang và nút hành động. Mặc định canh giữa — dàn trang dễ đọc hơn
 * khi tiêu đề nằm chính giữa thay vì lệch trái.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Nút/nút-link, đặt dưới tiêu đề khi canh giữa. */
  action?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-6 sm:mb-12',
        centered ? 'items-center text-center' : 'items-start',
        className,
      )}
    >
      <div className={cn(centered && 'mx-auto max-w-2xl')}>
        {eyebrow && (
          <span
            className={cn(
              'inline-flex items-center rounded-full border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground',
            )}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={cn(
            'text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]',
            eyebrow && 'mt-5',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}