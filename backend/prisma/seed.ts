import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { CATEGORIES, PRODUCTS } from './catalog.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryReady = Boolean(
  cloudName &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn(
    '⚠ Thiếu CLOUDINARY_* trong .env — giữ nguyên URL ảnh Unsplash. Điền key rồi chạy lại `pnpm prisma db seed` để đẩy ảnh lên CDN.',
  );
}

const uploadedByPublicId = new Map<string, string>();

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

const COLORS = ['Đen', 'Trắng', 'Xám', 'Be'];
const SIZES = ['S', 'M', 'L', 'XL'];
const IMAGE_BASE = 'https://images.unsplash.com';

function image(id: string, width = 1200) {
  return `${IMAGE_BASE}/${id}?w=${width}&q=80&fit=crop`;
}

/**
 * Stock khác nhau theo size để admin dashboard phản ánh thực tế hơn: S/M bán
 * nhiều hơn, XL ở tồn thấp. Vẫn giữ extraPrice 0 để không vỡ logic giá.
 */
function stockFor(color: string, size: string) {
  const sizeWeight = { S: 28, M: 34, L: 22, XL: 12 }[size] ?? 20;
  const colorOffset = COLORS.indexOf(color) * 3;
  return sizeWeight - colorOffset + 4;
}

/**
 * When Cloudinary credentials are present the seed pushes each Unsplash image
 * up and stores the CDN URL, so the catalog no longer hotlinks Unsplash.
 * Without credentials it silently falls back to the original Unsplash URL.
 */
async function resolveImage(
  remoteUrl: string,
  publicId: string,
): Promise<string> {
  if (!cloudinaryReady) return remoteUrl;

  const existing = uploadedByPublicId.get(publicId);
  if (existing) return existing;

  try {
    const uploaded = await cloudinary.uploader.upload(remoteUrl, {
      folder: 'ecom_dn/products',
      resource_type: 'image',
      public_id: publicId,
      overwrite: true,
    });
    uploadedByPublicId.set(publicId, uploaded.secure_url);
    return uploaded.secure_url;
  } catch (error) {
    console.warn(`  ! Không upload được ${publicId}:`, errorMessage(error));
    return remoteUrl;
  }
}

async function main() {
  const categoryBySlug = new Map<string, string>();

  for (const category of CATEGORIES) {
    const categoryImage = await resolveImage(
      image(category.image, 800),
      `category-${category.slug}`,
    );
    const data = { ...category, image: categoryImage };

    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: data,
      create: data,
    });
    categoryBySlug.set(category.slug, saved.id);
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);

  let created = 0;
  let updated = 0;

  for (const product of PRODUCTS) {
    const categoryId = categoryBySlug.get(product.categorySlug);
    if (!categoryId) throw new Error(`Missing category ${product.categorySlug}`);

    const slug = product.slug;
    const urls: string[] = [];
    for (const [index, photoId] of product.images.entries()) {
      urls.push(
        await resolveImage(image(photoId), `${slug}-${index + 1}`),
      );
    }
    const [thumbnail, ...gallery] = urls;

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.product.update({
        where: { slug },
        data: {
          name: product.name,
          description: product.description,
          brand: product.brand,
          basePrice: product.price,
          isFeatured: product.isFeatured ?? false,
          categoryId,
          thumbnail,
        },
      });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.createMany({
        data: urls.map((url, sortOrder) => ({
          productId: existing.id,
          url,
          sortOrder,
        })),
      });
      updated += 1;
      continue;
    }

    const variants = COLORS.flatMap((color) =>
      SIZES.map((size) => ({
        color,
        size,
        stock: stockFor(color, size),
      })),
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
          create: urls.map((url, sortOrder) => ({ url, sortOrder })),
        },
      },
    });
    created += 1;
  }

  console.log(
    `Seeded ${PRODUCTS.length} products (${created} mới, ${updated} cập nhật) và variants.`,
  );
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