import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('booking_products')
export class BookingProduct {
  @PrimaryColumn('uuid')
  booking_id: string;

  @Index()
  @PrimaryColumn('uuid')
  product_id: string;

  @ManyToOne(() => Booking, (booking) => booking.booking_products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Product, (product) => product.booking_products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: string;
}
