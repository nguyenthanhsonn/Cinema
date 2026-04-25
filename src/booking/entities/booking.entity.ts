import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { Cinema } from '../../cinema/entities/cinema.entity';
import { Room } from '../../cinema/entities/room.entity';
import { Movie } from '../../movie/entities/movie.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Showtime } from '../../showtime/entities/showtime.entity';
import { User } from '../../user/entities/user.entity';
import { BookingStatus } from '../enums/booking.enum';
import { BookingProduct } from './booking-product.entity';
import { BookingSeat } from './booking-seat.entity';
import { BookingStatusLog } from './booking-status-log.entity';

@Entity('bookings')
export class Booking extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30 })
  booking_code: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Index()
  @Column({ type: 'uuid' })
  showtime_id: string;

  @ManyToOne(() => Showtime, (showtime) => showtime.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'showtime_id' })
  showtime: Showtime;

  @Index()
  @Column({ type: 'uuid' })
  room_id: string;

  @ManyToOne(() => Room, (room) => room.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Index()
  @Column({ type: 'uuid' })
  cinema_id: string;

  @ManyToOne(() => Cinema, (cinema) => cinema.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cinema_id' })
  cinema: Cinema;


  @Column({ type: 'varchar', length: 160 })
  customer_name: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  customer_email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  customer_phone: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qr_code_url: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0' })
  total_price: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Index()
  status: BookingStatus;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  approved_by: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approved_by_user: User | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  rejected_by: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rejected_by' })
  rejected_by_user: User | null;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date | null;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  checked_in_by: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'checked_in_by' })
  checked_in_by_user: User | null;

  @Column({ type: 'timestamp', nullable: true })
  checked_in_at: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.booking)
  booking_seats: BookingSeat[];

  @OneToMany(() => BookingProduct, (bookingProduct) => bookingProduct.booking)
  booking_products: BookingProduct[];

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;

  @OneToMany(() => BookingStatusLog, (statusLog) => statusLog.booking)
  booking_status_logs: BookingStatusLog[];

  @OneToMany(() => Notification, (notification) => notification.booking)
  notifications: Notification[];
}
