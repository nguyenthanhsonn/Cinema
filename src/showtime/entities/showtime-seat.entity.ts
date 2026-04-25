import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { User } from '../../user/entities/user.entity';
import { BookingSeat } from '../../booking/entities/booking-seat.entity';
import { Seat } from '../../cinema/entities/seat.entity';
import { ShowtimeSeatStatus } from '../enums/showtime.enum';
import { Showtime } from './showtime.entity';

@Entity('showtime_seats')
@Unique(['showtime_id', 'seat_id'])
export class ShowtimeSeat extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  showtime_id: string;

  @ManyToOne(() => Showtime, (showtime) => showtime.showtime_seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'showtime_id' })
  showtime: Showtime;

  @Index()
  @Column({ type: 'uuid' })
  seat_id: string;

  @ManyToOne(() => Seat, (seat) => seat.showtime_seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

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

  @Column({
    type: 'enum',
    enum: ShowtimeSeatStatus,
    default: ShowtimeSeatStatus.AVAILABLE,
  })
  @Index()
  status: ShowtimeSeatStatus;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  locked_by_user_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'locked_by_user_id' })
  locked_by_user: User | null;

  @Column({ type: 'timestamp', nullable: true })
  lock_expires_at: Date | null;

  @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.showtime_seat)
  booking_seats: BookingSeat[];
}
