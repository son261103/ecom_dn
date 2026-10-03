import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class AdminListQueryDto {
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
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'UNISEX'])
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
}

export class CreateCategoryDto {
  @IsString()
  @MinLength(2, { message: 'Tên danh mục quá ngắn' })
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  slug?: string;

  @IsIn(['MALE', 'FEMALE', 'UNISEX'])
  gender: 'MALE' | 'FEMALE' | 'UNISEX';

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'UNISEX'])
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}