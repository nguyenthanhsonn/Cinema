import { ProductItemDto } from './product-item.dto';

export class ProductResponseDto {
  success: boolean;
  data: {
    message: string;
    product?: ProductItemDto;
    products?: ProductItemDto[];
    total?: number;
    page?: number;
    limit?: number;
  };
}