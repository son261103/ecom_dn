import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Parallax, Reveal } from '@/components/motion';
import { linkTo } from '@/lib/base-ui';

/**
 * Khối editorial ảnh lớn xen kẽ giữa các section sản phẩm, tạo nhịp thị
 * giác và ngắt nhịp ô lưới.
 */
export function EditorialBanner({
  eyebrow,
  title,
  description,
  href,
  cta,
  image,
  imageAlt,
  reverse = false,
  priority = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
  /** Đảo cột ảnh sang phải. */
  reverse?: boolean;
  /** Đặt true cho banner đầu tiên trên trang để ảnh không bị lazy-load. */
  priority?: boolean;
}) {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
            reverse ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          <Reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
              <Button size="lg" className="mt-8" {...linkTo(href)}>
                {cta}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-muted lg:aspect-4/5">
              <Parallax offset={50} className="absolute inset-0">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  priority={priority}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </Parallax>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}