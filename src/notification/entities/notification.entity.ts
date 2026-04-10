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
import { NotificationType } from '../enums/notification.enum';
import { Booking } from '../../booking/entities/booking.entity';

@Entity('notifications')
export class Notification extends CreatedAtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  booking_id: string | null;

  @ManyToOne(() => Booking, (booking) => booking.notifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  is_read: boolean;
}
