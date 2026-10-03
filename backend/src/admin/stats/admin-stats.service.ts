import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [
      productCount,
      activeProductCount,
      categoryCount,
      userCount,
      orderCount,
      pendingOrderCount,
      revenueAgg,
      lowStock,
    ] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.category.count(),
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      // Cancelled orders are excluded so the figure reflects real sales.
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    ]);

    const byStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const byGender = await this.prisma.product.groupBy({
      by: ['gender'],
      _count: { _all: true },
      where: { isActive: true },
    });

    return {
      products: { total: productCount, active: activeProductCount },
      categories: categoryCount,
      users: userCount,
      orders: {
        total: orderCount,
        pending: pendingOrderCount,
        byStatus: Object.fromEntries(
          byStatus.map((row) => [row.status, row._count._all]),
        ),
      },
      revenue: revenueAgg._sum.total ?? 0,
      lowStockVariants: lowStock,
      productsByGender: Object.fromEntries(
        byGender.map((row) => [row.gender, row._count._all]),
      ),
    };
  }
}