import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ProductCategory, ProductStatus } from '../../enums/product.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number = 0;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  image_url?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
