import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ProductCategory, ProductStatus } from '../../enums/product.enum';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  image_url?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
