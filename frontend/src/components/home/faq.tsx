import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section, SectionHeading } from '@/components/layout/section';
import { Reveal } from '@/components/motion';

const FAQS = [
  {
    q: 'Đổi trả sản phẩm trong bao lâu?',
    a: 'Bạn có 30 ngày kể từ khi nhận hàng để đổi size hoặc hoàn tiền. Sản phẩm cần còn nguyên tem mác và chưa qua sử dụng. Phí vận chuyển đổi trả do DN Fashion chi trả.',
  },
  {
    q: 'Phí giao hàng tính thế nào?',
    a: 'Đơn hàng từ 500.000đ được freeship toàn quốc. Đơn dưới ngưỡng này cộng 30.000đ phí vận chuyển. Thời gian giao dự kiến 2–4 ngày làm việc tùy khu vực.',
  },
  {
    q: 'Chọn size thế nào cho vừa?',
    a: 'Mỗi trang sản phẩm có bảng size riêng theo loại form (regular, slim, oversize). Nếu bạn thích mặc rộng, nên chọn size lớn hơn một bậc so với form ôm.',
  },
  {
    q: 'Sản phẩm có bị trải qua nhiều màu không?',
    a: 'Có. Mỗi sản phẩm có sẵn bốn màu cơ bản (Đen, Trắng, Xám, Be) với đầy đủ size từ S đến XL, tùy tồn kho của từng màu.',
  },
  {
    q: 'Tôi có thể đổi màu hoặc size sau khi đặt hàng?',
    a: 'Nếu đơn chưa được chuyển sang giao hàng, bạn liên hệ để được hỗ trợ đổi. Khi đã gửi đi, bạn dùng chính sách đổi trả 30 ngày ở trên.',
  },
];

export function Faq() {
  return (
    <Section className="border-b py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Hỏi đáp"
            title="Câu hỏi thường gặp"
            description="Những thắc mắc nhiều nhất về mua sắm tại DN Fashion."
            className="mb-0"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion className="rounded-2xl border bg-card px-6">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.q} value={`item-${index}`}>
                <AccordionTrigger className="text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}