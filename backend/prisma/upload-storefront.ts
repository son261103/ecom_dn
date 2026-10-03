import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Ảnh hero/banner của storefront không thuộc sản phẩm nào nên không nằm trong
 * catalog. Script này đẩy chúng lên CDN và in ra URL để thay trong component,
 * để storefront không còn hotlink Unsplash.
 */
const IMAGES = [
  { key: 'HERO_IMAGES.main', id: 'photo-1483985988355-763728e1935b', width: 1200 },
  { key: 'HERO_IMAGES.top', id: 'photo-1490481651871-ab68de25d43d', width: 800 },
  { key: 'HERO_IMAGES.bottom', id: 'photo-1617137968427-85924c800a22', width: 800 },
  { key: 'editorial.mua-thu', id: 'photo-1485462537746-965f33f7f6a7', width: 1600 },
  { key: 'listing.nam', id: 'photo-1617137968427-85924c800a22', width: 1600 },
  { key: 'listing.nu', id: 'photo-1490481651871-ab68de25d43d', width: 1600 },
  { key: 'listing.unisex', id: 'photo-1523381210434-271e8be1f52b', width: 1600 },
  { key: 'listing.featured', id: 'photo-1483985988355-763728e1935b', width: 1600 },
];

async function main() {
  for (const img of IMAGES) {
    const remote = `https://images.unsplash.com/${img.id}?w=${img.width}&q=80&fit=crop`;
    try {
      const up = await cloudinary.uploader.upload(remote, {
        folder: 'ecom_dn/storefront',
        resource_type: 'image',
        public_id: img.key,
        overwrite: true,
      });
      console.log(`${img.key}\n  ${up.secure_url}`);
    } catch (error) {
      console.error(`${img.key} FAIL:`, (error as Error)?.message);
    }
  }
  await prisma.$disconnect();
}

main();