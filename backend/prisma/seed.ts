import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Gender,
  PrismaClient,
} from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: 'Áo thun', slug: 'ao-thun', gender: Gender.MALE, sortOrder: 1 },
  { name: 'Áo sơ mi', slug: 'ao-so-mi', gender: Gender.MALE, sortOrder: 2 },
  { name: 'Quần jean', slug: 'quan-jean', gender: Gender.MALE, sortOrder: 3 },
  { name: 'Áo khoác', slug: 'ao-khoac', gender: Gender.MALE, sortOrder: 4 },
  { name: 'Áo thun', slug: 'ao-thun-nu', gender: Gender.FEMALE, sortOrder: 1 },
  { name: 'Áo blouse', slug: 'ao-blouse', gender: Gender.FEMALE, sortOrder: 2 },
  { name: 'Váy', slug: 'vay', gender: Gender.FEMALE, sortOrder: 3 },
  { name: 'Áo khoác', slug: 'ao-khoac-nu', gender: Gender.FEMALE, sortOrder: 4 },
  { name: 'Đồ unisex', slug: 'dong-unisex', gender: Gender.UNISEX, sortOrder: 1 },
];

const PRODUCTS: Array<{
  name: string;
  slug: string;
  description: string;
  brand: string;
  gender: Gender;
  categorySlug: string;
  price: number;
  isFeatured?: boolean;
  image: string;
  imageAlt: string;
}> = [
  {
    name: 'Áo thun cotton cổ tròn basic',
    slug: 'ao-thun-cotton-basic',
    description:
      'Áo thun cotton 100% thoáng khí, cổ tròn basic dễ phối đồ. Phù hợp cho cả nam và nữ.',
    brand: 'Basicline',
    gender: Gender.MALE,
    categorySlug: 'ao-thun',
    price: 289000,
    image: 'photo-1521572163474-6864f9cf17ab',
    imageAlt: 'photo-1503341504253-dff4815485f1',
    isFeatured: true,
  },
  {
    name: 'Áo sơ mi Oxford trắng',
    slug: 'ao-so-mi-oxford-trang',
    description:
      'Áo sơ mi vải Oxford dày dặn, form fit ôm dáng, phù hợp đi làm và dự lễ.',
    brand: 'Men Style',
    gender: Gender.MALE,
    categorySlug: 'ao-so-mi',
    price: 549000,
    image: 'photo-1602810318383-e386cc2a3ccf',
    imageAlt: 'photo-1620012253295-c15cc3e65df4',
    isFeatured: true,
  },
  {
    name: 'Quần jean slim fit đen',
    slug: 'quan-jean-slim-fit-den',
    description:
      'Quần jean slim fit màu đen, co giãn tốt, form ôm dáng thanh lịch.',
    brand: 'Denim Lab',
    gender: Gender.MALE,
    categorySlug: 'quan-jean',
    price: 749000,
    image: 'photo-1542272604-787c3835535d',
    imageAlt: 'photo-1475178626620-a4d074967452',
  },
  {
    name: 'Áo khoác bomber jacket',
    slug: 'ao-khoac-bomber-jacket',
    description:
      'Áo khoác bomber dự phòng ấm, form unisex, phù hợp thời tiết se lạnh.',
    brand: 'Urban Wear',
    gender: Gender.MALE,
    categorySlug: 'ao-khoac',
    price: 1290000,
    image: 'photo-1551028719-00167b16eac5',
    imageAlt: 'photo-1544022613-e87ca75a784a',
    isFeatured: true,
  },
  {
    name: 'Áo thun nữ cotton trắng',
    slug: 'ao-thun-nu-cotton-trang',
    description:
      'Áo thun nữ cotton trắng, form regular fit, chất liệu mềm mại thấm mồ hôi.',
    brand: 'Basicline',
    gender: Gender.FEMALE,
    categorySlug: 'ao-thun-nu',
    price: 259000,
    image: 'photo-1434389677669-e08b4cac3105',
    imageAlt: 'photo-1489987707025-afc232f7ea0f',
    isFeatured: true,
  },
  {
    name: 'Áo blouse lụa nữ',
    slug: 'ao-blouse-lua-nu',
    description:
      'Áo blouse lụa nữ cao cấp, form suông, phù hợp cho dịp vụ và đi làm.',
    brand: 'Ladies Class',
    gender: Gender.FEMALE,
    categorySlug: 'ao-blouse',
    price: 899000,
    image: 'photo-1594633312681-425c7b97ccd1',
    imageAlt: 'photo-1572804013309-59a88b7e92f1',
  },
  {
    name: 'Váy xếp ly midi',
    slug: 'vay-xep-ly-midi',
    description:
      'Váy xếp ly dài midi, form xòe nhẹ, phù hợp cho dịp dạo phố và dự lễ.',
    brand: 'Ladies Class',
    gender: Gender.FEMALE,
    categorySlug: 'vay',
    price: 1190000,
    image: 'photo-1583496661160-fb5886a0aaaa',
    imageAlt: 'photo-1595777457583-95e059d581b8',
    isFeatured: true,
  },
  {
    name: 'Áo khoác nữ oversized',
    slug: 'ao-khoac-nu-oversized',
    description:
      'Áo khoác nữ form oversized rộng, tạo vẻ cá tính và thoải mái.',
    brand: 'Urban Wear',
    gender: Gender.FEMALE,
    categorySlug: 'ao-khoac-nu',
    price: 1090000,
    image: 'photo-1548624313-0396c75e4b1a',
    imageAlt: 'photo-1591047139829-d91aecb6caea',
  },
  {
    name: 'Áo hoodie unisex oversize',
    slug: 'ao-hoodie-unisex-oversize',
    description:
      'Áo hoodie cotton dày, form oversize unisex, dễ mặc cả nam và nữ.',
    brand: 'Street Style',
    gender: Gender.UNISEX,
    categorySlug: 'dong-unisex',
    price: 699000,
    image: 'photo-1556821840-3a63f95609a7',
    imageAlt: 'photo-1551488831-00ddcb6c6bd3',
    isFeatured: true,
  },
];

const COLORS = ['Đen', 'Trắng', 'Xám', 'Be'];
const SIZES = ['S', 'M', 'L', 'XL'];
const IMAGE_BASE = 'https://images.unsplash.com';

function image(id: string, width = 1200) {
  return `${IMAGE_BASE}/${id}?w=${width}&q=80&fit=crop`;
}

async function main() {
  const categoryBySlug = new Map<string, string>();

  for (const category of CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryBySlug.set(category.slug, saved.id);
  }

  for (const product of PRODUCTS) {
    const categoryId = categoryBySlug.get(product.categorySlug);
    if (!categoryId) throw new Error(`Missing category ${product.categorySlug}`);

    const slug = product.slug;
    const thumbnail = image(product.image);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.product.update({
        where: { slug },
        data: { thumbnail },
      });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.createMany({
        data: [
          { productId: existing.id, url: thumbnail, sortOrder: 0 },
          { productId: existing.id, url: image(product.imageAlt), sortOrder: 1 },
        ],
      });
      continue;
    }

    const variants = COLORS.flatMap((color) =>
      SIZES.map((size) => ({ color, size, stock: 20 })),
    );

    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description,
        brand: product.brand,
        gender: product.gender,
        basePrice: product.price,
        thumbnail,
        isFeatured: product.isFeatured ?? false,
        categoryId,
        variants: { create: variants },
        images: {
          create: [
            { url: thumbnail, sortOrder: 0 },
            { url: image(product.imageAlt), sortOrder: 1 },
          ],
        },
      },
    });
  }

  console.log('Seeded products, categories and variants.');
}

async function run() {
  await main();
  await prisma.$disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});