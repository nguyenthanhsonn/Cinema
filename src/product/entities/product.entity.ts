import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { BookingProduct } from '../../booking/entities/booking-product.entity';
import { ProductCategory, ProductStatus } from '../enums/product.enum';

@Entity('products')
export class Product extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index()
  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (val: number) => val,
      from: (val: string) => parseFloat(val),
    },
  })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @Index()
  status: ProductStatus;

  @OneToMany(() => BookingProduct, (bookingProduct) => bookingProduct.product)
  booking_products: BookingProduct[];
}
