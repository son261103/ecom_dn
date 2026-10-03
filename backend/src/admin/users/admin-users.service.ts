import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role, type Prisma } from '../../generated/prisma/client.js';
import type { RequestUser } from '../../auth/types.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { paginate, searchWhere } from '../shared.js';
import {
  AdminUserListQueryDto,
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto/admin-user.dto.js';

const listSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { orders: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminUserListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.UserWhereInput = {
      ...(query.role && { role: query.role }),
      ...(searchWhere(query.search, ['email', 'fullName', 'phone']) as object),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: listSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items, meta: paginate(page, limit, total) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...listSelect,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Email đã được đăng ký');

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        fullName: dto.fullName,
        phone: dto.phone ?? null,
        role: dto.role ?? Role.CUSTOMER,
      },
      select: listSelect,
    });
  }

  /** Guards against an admin locking themselves out. */
  private assertNotSelf(actor: RequestUser, targetId: string, action: string) {
    if (actor.id === targetId) {
      throw new BadRequestException(`Không thể ${action} tài khoản của chính bạn`);
    }
  }

  /** Prevents removing the last remaining admin. */
  private async assertNotLastAdmin(userId: string) {
    const admins = await this.prisma.user.count({ where: { role: Role.ADMIN } });
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (target?.role === Role.ADMIN && admins <= 1) {
      throw new BadRequestException(
        'Phải còn ít nhất một quản trị viên trong hệ thống',
      );
    }
  }

  async update(id: string, dto: UpdateUserDto, actor: RequestUser) {
    await this.findOne(id);

    if (dto.role === Role.CUSTOMER) {
      this.assertNotSelf(actor, id, 'hạ quyền');
      await this.assertNotLastAdmin(id);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone || null }),
        ...(dto.role !== undefined && { role: dto.role }),
      },
      select: listSelect,
    });
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(dto.password, 10) },
    });
    return { reset: true };
  }

  async remove(id: string, actor: RequestUser) {
    const user = await this.findOne(id);

    this.assertNotSelf(actor, id, 'xoá');
    await this.assertNotLastAdmin(id);

    if (user._count.orders > 0) {
      throw new BadRequestException(
        `Người dùng đã có ${user._count.orders} đơn hàng, không thể xoá`,
      );
    }

    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}