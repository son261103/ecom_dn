import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { OrderStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

const SHIPPING_FEE = 30000;
const orderInclude = {
  items: {
    include: {
      product: { select: { name: true, slug: true, thumbnail: true } },
      variant: { select: { color: true, size: true } },
    },
  },
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const variantIds = dto.items.map((item) => item.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { basePrice: true, isActive: true } } },
    });

    if (variants.length !== variantIds.length) {
      throw new NotFoundException('Một số sản phẩm không còn tồn tại');
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let subtotal = 0;
    for (const item of dto.items) {
      const variant = variantMap.get(item.variantId)!;

      if (!variant.product.isActive) {
        throw new BadRequestException(
          `Sản phẩm không còn được bán: ${variant.id}`,
        );
      }
      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm không đủ tồn kho (còn ${variant.stock})`,
        );
      }

      subtotal += (variant.product.basePrice + variant.extraPrice) * item.quantity;
    }

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new BadRequestException('Tồn kho đã thay đổi, vui lòng thử lại');
        }
      }

      return tx.order.create({
        data: {
          orderNumber: `DN${randomUUID().slice(0, 8).toUpperCase()}`,
          status: OrderStatus.PENDING,
          subtotal,
          shippingFee: SHIPPING_FEE,
          total: subtotal + SHIPPING_FEE,
          recipientName: dto.recipientName,
          phone: dto.phone,
          address: dto.address,
          note: dto.note,
          userId,
          items: {
            create: dto.items.map((item) => {
              const variant = variantMap.get(item.variantId)!;
              return {
                variantId: item.variantId,
                productId: variant.productId,
                quantity: item.quantity,
                unitPrice: variant.product.basePrice + variant.extraPrice,
              };
            }),
          },
        },
        include: orderInclude,
      });
    });

    return order;
  }

  findAllForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    return order;
  }
}