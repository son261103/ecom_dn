import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Section, SectionHeading } from '@/components/layout/section';
import { ProductCard } from '@/components/product/product-card';
import { Reveal } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { linkTo } from '@/lib/base-ui';
import type { Product } from '@/lib/types';

/**
 * Carousel "mới về" — dùng Carousel của shadcn (Embla) nên kéo được bằng
 * chuột, bàn phím và có nút mũi tên trên desktop.
 */
export function ProductRail({
  products,
  title,
  eyebrow,
  description,
  viewAllHref,
}: {
  products: Product[];
  title: string;
  eyebrow?: string;
  description?: string;
  viewAllHref: string;
}) {
  if (products.length === 0) return null;

  return (
    <Section className="border-b py-16 lg:py-20">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Button variant="outline" {...linkTo(viewAllHref)}>
            Xem tất cả
          </Button>
        }
      />

      <Reveal>
        <Carousel
          opts={{ align: 'start', loop: products.length > 4 }}
          className="px-1"
        >
          <CarouselContent className="-ml-4 gap-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-1/2 pl-4 sm:basis-1/3 lg:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 hidden lg:flex" />
          <CarouselNext className="right-2 hidden lg:flex" />
        </Carousel>
      </Reveal>
    </Section>
  );
}