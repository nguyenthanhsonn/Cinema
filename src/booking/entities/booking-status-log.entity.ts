import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreatedAtEntity } from '../../common/entities/created-at.entity';
import { User } from '../../user/entities/user.entity';
import { BookingStatus } from '../enums/booking.enum';
import { Booking } from './booking.entity';

@Entity('booking_status_logs')
export class BookingStatusLog extends CreatedAtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  booking_id: string;

  @ManyToOne(() => Booking, (booking) => booking.booking_status_logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'enum', enum: BookingStatus, nullable: true })
  from_status: BookingStatus | null;

  @Column({ type: 'enum', enum: BookingStatus })
  to_status: BookingStatus;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  acted_by_user_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'acted_by_user_id' })
  acted_by_user: User | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;
}
