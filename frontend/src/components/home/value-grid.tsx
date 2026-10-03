import { Truck, RefreshCw, PackageCheck, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Section, SectionHeading } from '@/components/layout/section';
import { Stagger, StaggerItem } from '@/components/motion';

const VALUES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Truck,
    title: 'Freeship từ 500K',
    text: 'Đơn từ 500.000đ miễn phí vận chuyển toàn quốc, đơn dưới ngưỡng chỉ 30.000đ.',
  },
  {
    icon: RefreshCw,
    title: 'Đổi trả 30 ngày',
    text: 'Đổi size hoặc hoàn tiền trong 30 ngày kể từ khi nhận hàng, miễn phí.',
  },
  {
    icon: PackageCheck,
    title: 'Đổi mới lỗi sản xuất',
    text: 'Sản phẩm lỗi sản xuất được đổi mới ngay, không thu phí vận chuyển.',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh toán an toàn',
    text: 'Thông tin thanh toán được mã hoá, không lưu chi tiết thẻ trên hệ thống.',
  },
];

export function ValueGrid() {
  return (
    <Section className="border-b py-16 lg:py-20">
      <SectionHeading
        eyebrow="Cam kết"
        title="Mua sắm không lo rắc rối"
        description="Những cam kết áp dụng cho mọi đơn hàng, không phụ thuộc giá trị đơn."
      />

      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((value) => (
          <StaggerItem key={value.title}>
            <div className="h-full rounded-2xl border bg-card p-6 transition-shadow duration-300 hover:shadow-lg">
              <span className="grid size-11 place-items-center rounded-xl bg-muted">
                <value.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.text}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}