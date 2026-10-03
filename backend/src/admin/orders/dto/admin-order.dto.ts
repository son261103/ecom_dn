import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/enums.js';

export class AdminOrderListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'])
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'])
  status: OrderStatus;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  note?: string;
}