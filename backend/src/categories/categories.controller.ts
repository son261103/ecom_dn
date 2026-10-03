import { Controller, Get, Query } from '@nestjs/common';
import { IsIn, IsOptional } from 'class-validator';
import { Public } from '../decorators/public.decorator.js';
import { CategoriesService } from './categories.service.js';

class CategoriesQueryDto {
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'UNISEX'])
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
}

/** Category browsing is public, same as the product catalog. */
@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query() query: CategoriesQueryDto) {
    return this.categoriesService.findAll(query.gender);
  }
}