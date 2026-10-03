import { Marquee } from '@/components/motion';
import { cn } from '@/lib/utils';

const ITEMS = [
  'Freeship từ 500K',
  'Đổi trả 30 ngày',
  'Đổi size miễn phí',
  'Chất liệu cotton cao cấp',
  '4 màu · 4 size mỗi mẫu',
  'Đổi mới lỗi sản xuất',
];

/**
 * Dải cam kết chạy ngang giữa các section. Được render hai lần bên trong
 * `Marquee` nên nhịp chạy liền mạch, không thấy điểm lặp.
 */
export function MarqueeBand() {
  return (
    <div className="border-b bg-muted/40 py-4">
      <Marquee className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {ITEMS.map((item) => (
          <span key={item} className="flex items-center gap-8">
            {item}
            <span className={cn('size-1.5 rounded-full bg-foreground/30')} />
          </span>
        ))}
      </Marquee>
    </div>
  );
}