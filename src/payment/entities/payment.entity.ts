import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreatedAtEntity } from '../../common/entities/created-at.entity';
import { PaymentProvider, PaymentStatus } from '../enums/payment.enum';
import { Booking } from '../../booking/entities/booking.entity';

@Entity('payments')
export class Payment extends CreatedAtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  booking_id: string;

  @OneToOne(() => Booking, (booking) => booking.payment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Index()
  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_id: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Index()
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date | null;
}
