import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../decorators/public.decorator.js';
import { GetProductsQueryDto } from './dto/get-products-query.dto.js';
import { ProductsService } from './products.service.js';

/** Browsing the catalog does not require an account. */
@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: GetProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }
}