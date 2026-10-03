import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { AdminOrdersService } from './admin-orders.service.js';
import {
  AdminOrderListQueryDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from './dto/admin-order.dto.js';

@UseGuards(new RolesGuard([Role.ADMIN]))
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly service: AdminOrdersService) {}

  @Get()
  findAll(@Query() query: AdminOrderListQueryDto) {
    return this.service.findAll(query);
  }

  /** Declared before ':id' so the extra segment is not swallowed by it. */
  @Get(':id/transitions')
  transitions(@Param('id') id: string) {
    return this.service.findOne(id).then((order) => ({
      current: order.status,
      allowed: this.service.allowedTransitions(order.status),
    }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}