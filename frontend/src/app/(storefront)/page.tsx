import { Button } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/layout/section';
import { ProductCard } from '@/components/product/product-card';
import { Stagger, StaggerItem } from '@/components/motion';
import { Hero } from '@/components/home/hero';
import { MarqueeBand } from '@/components/home/marquee-band';
import { CategoryGrid } from '@/components/home/category-grid';
import { ProductRail } from '@/components/home/product-rail';
import { EditorialBanner } from '@/components/home/editorial-banner';
import { StatsBand } from '@/components/home/stats-band';
import { ValueGrid } from '@/components/home/value-grid';
import { Faq } from '@/components/home/faq';
import { Newsletter } from '@/components/home/newsletter';
import { categoriesApi, productsApi } from '@/lib/api';
import { linkTo } from '@/lib/base-ui';
import type { Gender, Product } from '@/lib/types';

const EMPTY = {
  items: [] as Product[],
  meta: { total: 0, page: 1, limit: 1, totalPages: 1 },
};

/** Đếm tổng theo gender bằng `limit: 1` để không tải cả danh sách về. */
async function countBy(gender?: Gender) {
  const result = await productsApi
    .list({ gender, limit: 1 })
    .catch(() => EMPTY);
  return result.meta.total;
}

export default async function HomePage() {
  const [men, women, unisex, featured, newest, categories, total, maleCount, femaleCount] =
    await Promise.all([
      productsApi.list({ gender: 'MALE', limit: 8 }).catch(() => EMPTY),
      productsApi.list({ gender: 'FEMALE', limit: 8 }).catch(() => EMPTY),
      productsApi.list({ gender: 'UNISEX', limit: 8 }).catch(() => EMPTY),
      productsApi.featured().catch(() => [] as Product[]),
      productsApi.list({ limit: 12 }).catch(() => EMPTY),
      categoriesApi.list().catch(() => []),
      countBy(),
      countBy('MALE'),
      countBy('FEMALE'),
    ]);

  const spotlight = featured[0];

  // Ảnh dự phòng cho tile danh mục khi category chưa có ảnh riêng.
  const fallbackImages: Partial<Record<Gender, string>> = {
    MALE: men.items[0]?.thumbnail,
    FEMALE: women.items[0]?.thumbnail,
    UNISEX: unisex.items[0]?.thumbnail,
  };

  return (
    <>
      <Hero spotlight={spotlight} />
      <MarqueeBand />

      <CategoryGrid categories={categories} fallbackImages={fallbackImages} />

      {featured.length > 0 && (
        <ProductSection
          eyebrow="Bán chạy"
          title="Sản phẩm nổi bật"
          description="Những món đồ khách hàng chọn nhiều nhất tháng này."
          href="/featured"
          products={featured.slice(0, 4)}
        />
      )}

      <ProductRail
        eyebrow="Mới về"
        title="Hàng mới trong tuần"
        description="Những mẫu vừa được thêm vào kho, sẵn sàng giao ngay."
        viewAllHref="/featured"
        products={newest.items}
      />

      {unisex.items.length > 0 && (
        <Section className="border-b py-16 lg:py-20">
          <SectionHeading
            eyebrow="Unisex"
            title="Đồ mặc chung"
            description="Những mẫu form rộng, dễ mặc cho cả nam và nữ."
            action={
              <Button variant="outline" {...linkTo('/unisex')}>
                Xem tất cả
              </Button>
            }
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {unisex.items.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      )}

      <ProductSection
        eyebrow="Nam"
        title="Thời trang nam"
        description="Sơ mi, quần jean, bomber — những món không bao giờ lỗi thời."
        href="/nam"
        products={men.items.slice(0, 4)}
      />

      <ProductSection
        eyebrow="Nữ"
        title="Thời trang nữ"
        description="Váy xếp ly, blouse lụa và blazer cho mọi dịp."
        href="/nu"
        products={women.items.slice(0, 4)}
      />

      <EditorialBanner
        eyebrow="Phong cách"
        title="Mùa thu đến, tủ đồ đổi mùa"
        description="Chất liệu dày vừa, layer linh hoạt. Một bộ sưu tập đủ để bạn thay đổi phong cách mỗi ngày mà không tốn quá nhiều chi phí."
        href="/featured"
        cta="Khám phá bộ sưu tập"
        image="https://res.cloudinary.com/zhloiovg/image/upload/v1791007922/ecom_dn/storefront/editorial.mua-thu.jpg"
        imageAlt="Bộ sưu tập thời trang mùa thu"
      />

      <StatsBand
        stats={{
          products: total,
          categories: categories.length,
          male: maleCount,
          female: femaleCount,
        }}
      />

      <ValueGrid />
      <Faq />
      <Newsletter />
    </>
  );
}

function ProductSection({
  eyebrow,
  title,
  description,
  href,
  products,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <Section className="border-b py-16 lg:py-20">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Button variant="outline" {...linkTo(href)}>
            Xem tất cả
          </Button>
        }
      />
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <StaggerItem key={product.id}>
            <ProductCard product={product} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}