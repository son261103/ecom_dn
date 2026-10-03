import { Section } from '@/components/layout/section';
import { AnimatedNumber, Reveal, Stagger, StaggerItem } from '@/components/motion';
import type { LucideIcon } from 'lucide-react';
import { Shirt, Users, Sparkles, Package } from 'lucide-react';

export interface StatItem {
  value: number;
  label: string;
  icon: LucideIcon;
  /** Hậu tố hiển thị sau con số, ví dụ "mẫu". */
  suffix?: string;
}

const ICONS = [Shirt, Users, Sparkles, Package];

/**
 * Số liệu lấy từ API thật (`meta.total` của /api/products và
 * /api/categories), không dùng số bịa ra cho khách.
 */
export function StatsBand({
  stats,
}: {
  stats: { products: number; categories: number; male: number; female: number };
}) {
  const items: StatItem[] = [
    { value: stats.products, label: 'Sản phẩm trong catalog', icon: Shirt },
    { value: stats.categories, label: 'Danh mục sản phẩm', icon: Package },
    { value: stats.male, label: 'Mẫu thời trang nam', icon: Users },
    { value: stats.female, label: 'Mẫu thời trang nữ', icon: Sparkles },
  ];

  return (
    <Section className="border-b bg-foreground py-16 text-background lg:py-20">
      <Reveal className="mb-10 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          DN Fashion không lớn, nhưng chọn lọc kỹ
        </h2>
        <p className="mt-3 text-background/70">
          Mỗi mẫu đều được kiểm tra chất liệu và form dáng trước khi lên kệ —
          đúng những gì bạn cần, không hơn.
        </p>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon ?? ICONS[index % ICONS.length];
          return (
            <StaggerItem key={item.label}>
              <div>
                <Icon className="size-6 text-background/50" />
                <p className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl">
                  <AnimatedNumber value={item.value} />
                </p>
                <p className="mt-2 text-sm text-background/70">
                  {item.label}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}