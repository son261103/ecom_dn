import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { paginate, searchWhere } from '../shared.js';
import { slugify } from '../utils/slug.js';
import {
  AdjustStockDto,
  AdminProductListQueryDto,
  CreateProductDto,
  UpdateProductDto,
  VariantInputDto,
} from './dto/admin-product.dto.js';

const include = {
  category: true,
  variants: { orderBy: [{ color: 'asc' as const }, { size: 'asc' as const }] },
  images: { orderBy: { sortOrder: 'asc' as const } },
  _count: { select: { orderItems: true } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminProductListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ProductWhereInput = {
      ...(query.gender && { gender: query.gender }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.isActive && { isActive: query.isActive === 'true' }),
      ...(query.isFeatured && { isFeatured: query.isFeatured === 'true' }),
      ...(searchWhere(query.search, ['name', 'slug', 'brand']) as object),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items, meta: paginate(page, limit, total) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        ...include,
        variants: {
          include: { _count: { select: { orderItems: true } } },
          orderBy: [{ color: 'asc' }, { size: 'asc' }],
        },
      },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  private assertSlugFree(slug: string, ignoreId?: string) {
    return this.prisma.product.findFirst({
      where: { slug, ...(ignoreId && { id: { not: ignoreId } }) },
      select: { id: true },
    });
  }

  private assertCategoryExists(categoryId: string) {
    return this.prisma.category
      .findUnique({ where: { id: categoryId }, select: { id: true } })
      .then((found) => {
        if (!found) throw new NotFoundException('Không tìm thấy danh mục');
      });
  }

  /** Rejects duplicate color/size pairs before they hit the unique index. */
  private assertNoDuplicateVariants(variants: VariantInputDto[]) {
    const seen = new Set<string>();
    for (const variant of variants) {
      const key = `${variant.color.trim().toLowerCase()}|${variant.size.trim().toLowerCase()}`;
      if (seen.has(key)) {
        throw new ConflictException(
          `Trùng màu "${variant.color}" với size "${variant.size}"`,
        );
      }
      seen.add(key);
    }
  }

  async create(dto: CreateProductDto) {
    const slug = slugify(dto.slug ?? dto.name);
    if (await this.assertSlugFree(slug)) {
      throw new ConflictException(`Slug "${slug}" đã được dùng`);
    }
    await this.assertCategoryExists(dto.categoryId);

    const variants = dto.variants ?? [];
    this.assertNoDuplicateVariants(variants);

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        brand: dto.brand,
        gender: dto.gender,
        basePrice: dto.basePrice,
        thumbnail: dto.thumbnail,
        categoryId: dto.categoryId,
        isFeatured: dto.isFeatured ?? false,
        isActive: dto.isActive ?? true,
        variants: {
          create: variants.map((v) => ({
            color: v.color.trim(),
            size: v.size.trim(),
            stock: v.stock ?? 0,
            extraPrice: v.extraPrice ?? 0,
          })),
        },
        images: {
          create: (dto.images ?? []).map((image, index) => ({
            url: image.url,
            sortOrder: index,
          })),
        },
      },
      include,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const slug = dto.slug ? slugify(dto.slug) : dto.name ? slugify(dto.name) : undefined;
    if (slug && (await this.assertSlugFree(slug, id))) {
      throw new ConflictException(`Slug "${slug}" đã được dùng`);
    }
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    if (dto.variants) this.assertNoDuplicateVariants(dto.variants);

    return this.prisma.$transaction(async (tx) => {
      if (dto.variants) {
        await this.syncVariants(tx, id, dto.variants);
      }
      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: dto.images.map((image, index) => ({
            productId: id,
            url: image.url,
            sortOrder: index,
          })),
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(slug !== undefined && { slug }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.brand !== undefined && { brand: dto.brand }),
          ...(dto.gender !== undefined && { gender: dto.gender }),
          ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
          ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
        include,
      });
    });
  }

  /**
   * Replaces the variant set while preserving rows already referenced by past
   * orders — deleting those would break order history.
   */
  private async syncVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    next: VariantInputDto[],
  ) {
    const current = await tx.productVariant.findMany({
      where: { productId },
      select: { id: true, color: true, size: true },
    });

    const keyOf = (color: string, size: string) =>
      `${color.trim().toLowerCase()}|${size.trim().toLowerCase()}`;

    const nextByKey = new Map(next.map((v) => [keyOf(v.color, v.size), v]));
    const currentByKey = new Map(current.map((v) => [keyOf(v.color, v.size), v]));

    const toCreate = next.filter(
      (v) => !currentByKey.has(keyOf(v.color, v.size)),
    );
    const toUpdate = next.filter((v) => {
      const existing = currentByKey.get(keyOf(v.color, v.size));
      return existing && (v.stock !== undefined || v.extraPrice !== undefined);
    });
    const nextKeys = new Set(nextByKey.keys());
    const toDelete = current.filter((v) => !nextKeys.has(keyOf(v.color, v.size)));

    if (toDelete.length > 0) {
      const referenced = await tx.orderItem.count({
        where: { variantId: { in: toDelete.map((v) => v.id) } },
      });
      if (referenced > 0) {
        throw new BadRequestException(
          'Không thể xoá biến thể đã có trong đơn hàng. Hãy đặt tồn kho về 0 thay vì xoá.',
        );
      }
      await tx.productVariant.deleteMany({
        where: { id: { in: toDelete.map((v) => v.id) } },
      });
    }

    for (const variant of toCreate) {
      await tx.productVariant.create({
        data: {
          productId,
          color: variant.color.trim(),
          size: variant.size.trim(),
          stock: variant.stock ?? 0,
          extraPrice: variant.extraPrice ?? 0,
        },
      });
    }

    for (const variant of toUpdate) {
      const existing = currentByKey.get(keyOf(variant.color, variant.size))!;
      await tx.productVariant.update({
        where: { id: existing.id },
        data: {
          ...(variant.stock !== undefined && { stock: variant.stock }),
          ...(variant.extraPrice !== undefined && { extraPrice: variant.extraPrice }),
        },
      });
    }
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id },
    });
    if (!variant) throw new NotFoundException('Không tìm thấy biến thể');

    const next =
      dto.mode === 'SET'
        ? dto.quantity
        : dto.mode === 'INCREASE'
          ? variant.stock + dto.quantity
          : variant.stock - dto.quantity;

    if (next < 0) {
      throw new BadRequestException(
        `Tồn kho không thể âm (hiện tại: ${variant.stock})`,
      );
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: { stock: next },
      include: { product: { select: { name: true, slug: true } } },
    });
  }

  /** Soft delete: products can appear in order history, so hide instead. */
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    if (product.isActive) {
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        deleted: false,
        message:
          'Sản phẩm đã được ẩn (soft delete) vì có thể xuất hiện trong đơn hàng cũ.',
      };
    }

    const orderItemCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderItemCount > 0) {
      throw new BadRequestException(
        'Sản phẩm đã có trong đơn hàng, không thể xoá hẳn.',
      );
    }

    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }
}