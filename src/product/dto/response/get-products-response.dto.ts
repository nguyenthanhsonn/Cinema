import { ProductItemDto } from './product-item.dto';

// DTO response dành riêng cho API lấy danh sách sản phẩm.
// Khác ProductResponseDto ở chỗ API này trả nhiều products và thông tin phân trang.
export class GetProductsResponseDto {
  success: boolean;
  data: {
    message: string;
    // Danh sách sản phẩm sau khi đã search/filter/pagination.
    products: ProductItemDto[];
    // Tổng số sản phẩm khớp điều kiện, dùng để frontend tính tổng số trang.
    total: number;
    // Trang hiện tại client đang xem.
    page: number;
    // Số sản phẩm tối đa trên mỗi trang.
    limit: number;
  };
}
