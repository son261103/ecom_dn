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
import { AdminCategoriesService } from './admin-categories.service.js';
import {
  AdminListQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/admin-category.dto.js';

@UseGuards(new RolesGuard([Role.ADMIN]))
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}

  @Get()
  findAll(@Query() query: AdminListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}