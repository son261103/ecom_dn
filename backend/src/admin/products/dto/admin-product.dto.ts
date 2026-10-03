import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AdminProductListQueryDto {
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

  @IsOptional()
  @IsString()
  categoryId?: string;

  /** 'true' / 'false' / omitted for all. */
  @IsOptional()
  @IsIn(['true', 'false'])
  isActive?: 'true' | 'false';

  @IsOptional()
  @IsIn(['true', 'false'])
  isFeatured?: 'true' | 'false';
}

export class VariantInputDto {
  @IsString()
  @MinLength(1, { message: 'Màu sắc không được để trống' })
  color: string;

  @IsString()
  @MinLength(1, { message: 'Kích cỡ không được để trống' })
  size: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  extraPrice?: number;
}

export class ImageInputDto {
  @IsUrl({ require_tld: false }, { message: 'URL ảnh không hợp lệ' })
  url: string;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Tên sản phẩm quá ngắn' })
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug chỉ gồm chữ thường, số và dấu gạch ngang' })
  slug?: string;

  @IsString()
  @MinLength(10, { message: 'Mô tả quá ngắn' })
  description: string;

  @IsString()
  @MinLength(2)
  brand: string;

  @IsIn(['MALE', 'FEMALE', 'UNISEX'])
  gender: 'MALE' | 'FEMALE' | 'UNISEX';

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Giá không hợp lệ' })
  basePrice: number;

  @IsUrl({ require_tld: false }, { message: 'URL ảnh không hợp lệ' })
  thumbnail: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  variants?: VariantInputDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  images?: ImageInputDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  brand?: string;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'UNISEX'])
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  thumbnail?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** When provided, replaces the whole variant set. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  variants?: VariantInputDto[];

  /** When provided, replaces the whole gallery. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  images?: ImageInputDto[];
}

export class AdjustStockDto {
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  quantity: number;

  @IsIn(['SET', 'INCREASE', 'DECREASE'])
  mode: 'SET' | 'INCREASE' | 'DECREASE';
}