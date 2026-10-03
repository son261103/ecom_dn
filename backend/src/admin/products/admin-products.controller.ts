import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { AdminProductsService } from './admin-products.service.js';
import {
  AdjustStockDto,
  AdminProductListQueryDto,
  CreateProductDto,
  UpdateProductDto,
} from './dto/admin-product.dto.js';

@UseGuards(new RolesGuard([Role.ADMIN]))
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly service: AdminProductsService) {}

  @Get()
  findAll(@Query() query: AdminProductListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /** Declared before ':id' so the extra path segment is not swallowed by it. */
  @Patch('variants/:variantId/stock')
  adjustStock(
    @Param('variantId') variantId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.service.adjustStock(variantId, dto);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  /** Soft-deletes when the product appears in any order. */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}