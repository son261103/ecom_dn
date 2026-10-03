import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(gender?: 'MALE' | 'FEMALE' | 'UNISEX') {
    return this.prisma.category.findMany({
      where: gender ? { gender } : undefined,
      orderBy: [{ gender: 'asc' }, { sortOrder: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  }
}