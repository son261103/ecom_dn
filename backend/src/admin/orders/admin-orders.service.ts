import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, type Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { paginate, searchWhere } from '../shared.js';
import {
  AdminOrderListQueryDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from './dto/admin-order.dto.js';

const STATUSES = Object.values(OrderStatus);

/**
 * Which statuses may follow which. Cancelling after an order ships would
 * misrepresent reality, and a delivered order is terminal.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
  SHIPPING: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
};

const include = {
  user: { select: { id: true, email: true, fullName: true, phone: true } },
  items: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, thumbnail: true },
      },
      variant: { select: { id: true, color: true, size: true } },
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminOrderListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.userId && { userId: query.userId }),
      ...(searchWhere(query.search, [
        'orderNumber',
        'recipientName',
        'phone',
      ]) as object),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
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
    const order = await this.prisma.order.findUnique({
      where: { id },
      include,
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    if (!STATUSES.includes(dto.status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }
    if (order.status === dto.status) return order;

    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${order.status}" sang "${dto.status}". ` +
          `Chỉ chuyển sang: ${allowed.length ? allowed.join(', ') : '(không có)'}`,
      );
    }

    // Cancelling returns the reserved units to stock.
    if (dto.status === OrderStatus.CANCELLED) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status: OrderStatus.CANCELLED },
        });
      });
    } else {
      await this.prisma.order.update({
        where: { id },
        data: { status: dto.status },
      });
    }

    return this.findOne(id);
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.recipientName !== undefined && { recipientName: dto.recipientName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
      include,
    });
  }

  /** Returns the statuses reachable from the order's current one. */
  allowedTransitions(status: OrderStatus): OrderStatus[] {
    return ALLOWED_TRANSITIONS[status];
  }

  async remove(id: string) {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Chỉ xoá được đơn đã huỷ. Hãy chuyển sang CANCELLED trước.',
      );
    }

    // Only cancelled orders are removed, so restock first if ever needed.
    await this.prisma.order.delete({ where: { id } });
    return { deleted: true };
  }
}