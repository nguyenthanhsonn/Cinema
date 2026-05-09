import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/request/create-product.dto';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductResponseDto } from './dto/response/product-response.dto';
import { ProductItemDto } from './dto/response/product-item.dto';
import { ProductStatus } from './enums/product.enum';
import { GetProductsQueryDto } from './dto/request/get-products-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  // tìm sản phẩm theo tên
  private async findByName(name: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { name: name.trim() } });
  }

  // Tìm sản phẩm theo id
  private async findById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  // Map entity Product sang DTO trả về cho client.
  private mapToProductItem(product: Product): ProductItemDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      status: product.status,
      created_at: product.created_at,
    };
  }

  // Xây dựng query tìm kiếm sản phẩm
  private async buildProductQuery(query: GetProductsQueryDto): Promise<ProductResponseDto> {
    const page = Math.max(Number(query.page), 1) || 1;
    const limit = Math.max(Number(query.limit), 1) || 10;
    const { search, category, status } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.category', 'product.price', 'product.stock', 'product.image_url', 'product.status', 'product.created_at'])

    if (search) {
      queryBuilder.andWhere('(product.name ILIKE :search OR product.category ILIKE :search)', { search: `%${search}%` });
    }
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    const [products, total] = await queryBuilder
      .orderBy('product.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        message: 'Lấy danh sách sản phẩm thành công',
        products: products.map((product) => this.mapToProductItem(product)),
        total,
        page,
        limit,
      },
    };
  }



  // thêm sản phẩm
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    // kiểm tra sản phẩm đã tồn tại chưa
    const existingProduct = await this.findByName(dto.name);
    if (existingProduct) {
      throw new BadRequestException('Sản phẩm đã tồn tại');
    }

    const product = this.productRepository.create({
      ...dto,
      name: dto.name.trim(),
      stock: dto.stock ?? 0,
    });

    const savedProduct = await this.productRepository.save(product);

    return {
      success: true,
      data: {
        message: 'Tạo sản phẩm thành công',
        product: this.mapToProductItem(savedProduct),
      },
    };
  }


  // lấy chi tiết sản phẩm theo id
  async detailProduct(id: string): Promise<ProductResponseDto> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return {
      success: true,
      data: {
        message: 'Lấy thông tin sản phẩm thành công',
        product: this.mapToProductItem(product),
      },
    };
  }

  // cập nhật sản phẩm
  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (dto.name) {
      const existingProduct = await this.findByName(dto.name);
      if (existingProduct && existingProduct.id !== id) {
        throw new BadRequestException('Tên sản phẩm đã tồn tại');
      }
    }
    // dùng merge + save đỡ tốn 1 query DB
    const updatedProduct = this.productRepository.merge(product, {
      ...dto,
      name: dto.name?.trim() ?? product.name,
    });

    await this.productRepository.save(updatedProduct);

    return {
      success: true,
      data: {
        message: 'Cập nhật sản phẩm thành công',
        product: this.mapToProductItem(updatedProduct),
      },
    };
  }

  // xoá mềm sản phẩm bằng cách chuyển trạng thái inactive.
  async removeProduct(id: string): Promise<ProductResponseDto> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    product.status = ProductStatus.INACTIVE;
    const savedProduct = await this.productRepository.save(product);

    return {
      success: true,
      data: {
        message: 'Xoá sản phẩm thành công',
        product: this.mapToProductItem(savedProduct),
      },
    };
  }


  // xem tất cả sản phẩm
  async getAllProducts(query: GetProductsQueryDto): Promise<ProductResponseDto> {
    return this.buildProductQuery(query);
  }

  // Lấy sản phẩm đang bán (status = available) — dùng khi khách chọn combo lúc đặt vé
  async getAvailableProducts(): Promise<ProductResponseDto> {
    const products = await this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      data: {
        message: 'Lấy danh sách sản phẩm thành công',
        products: products.map((product) => this.mapToProductItem(product)),
      },
    };
  }
}
