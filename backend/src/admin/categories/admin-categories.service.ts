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
  AdminListQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/admin-category.dto.js';

const include = {
  _count: { select: { products: true } },
} satisfies Prisma.CategoryInclude;

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.CategoryWhereInput = {
      ...(query.gender && { gender: query.gender }),
      ...(searchWhere(query.search, ['name', 'slug']) as object),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        include,
        orderBy: [{ gender: 'asc' }, { sortOrder: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items, meta: paginate(page, limit, total) };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include,
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  private async assertSlugFree(slug: string, ignoreId?: string) {
    const clash = await this.prisma.category.findUnique({ where: { slug } });
    if (clash && clash.id !== ignoreId) {
      throw new ConflictException(`Slug "${slug}" đã được dùng`);
    }
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.slug ?? dto.name);
    await this.assertSlugFree(slug);

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        gender: dto.gender,
        image: dto.image ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
      include,
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    const slug = dto.slug ? slugify(dto.slug) : dto.name ? slugify(dto.name) : undefined;
    if (slug) await this.assertSlugFree(slug, id);

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(slug !== undefined && { slug }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.image !== undefined && { image: dto.image || null }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
      include,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new BadRequestException(
        `Danh mục còn ${productCount} sản phẩm, hãy chuyển hoặc xoá chúng trước`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }
}