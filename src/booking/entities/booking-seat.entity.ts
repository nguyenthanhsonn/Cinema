import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Seat } from '../../cinema/entities/seat.entity';
import { ShowtimeSeat } from '../../showtime/entities/showtime-seat.entity';

@Entity('booking_seats')
@Unique(['booking_id', 'seat_id'])
export class BookingSeat {
  @PrimaryColumn('uuid')
  booking_id: string;

  @Index()
  @PrimaryColumn('uuid')
  showtime_seat_id: string;

  @Index()
  @Column({ type: 'uuid' })
  seat_id: string;

  @ManyToOne(() => Booking, (booking) => booking.booking_seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Seat, (seat) => seat.booking_seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

  @ManyToOne(() => ShowtimeSeat, (showtimeSeat) => showtimeSeat.booking_seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'showtime_seat_id' })
  showtime_seat: ShowtimeSeat;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: string;
}
