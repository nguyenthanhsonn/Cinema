import { ProductCategory, ProductStatus } from '../../enums/product.enum';

export class ProductItemDto {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image_url: string | null;
  status: ProductStatus;
  created_at: Date;
}
