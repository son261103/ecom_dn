import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetProductsQueryDto } from './dto/get-products-query.dto.js';

const productInclude = {
  category: { select: { id: true, name: true, slug: true, gender: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: [{ color: 'asc' as const }, { size: 'asc' as const }] },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.gender && { gender: query.gender }),
      ...(query.category && { category: { slug: query.category } }),
      ...(query.featured === 'true' && { isFeatured: true }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { brand: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        ...productInclude,
        category: true,
      },
    });

    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    return product;
  }

  async findFeatured(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}