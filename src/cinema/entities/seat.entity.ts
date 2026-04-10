import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CreatedAtEntity } from '../../common/entities/created-at.entity';
import { BookingSeat } from '../../booking/entities/booking-seat.entity';
import { ShowtimeSeat } from '../../showtime/entities/showtime-seat.entity';
import { SeatType } from '../enums/cinema.enum';
import { Room } from './room.entity';

@Entity('seats')
@Unique(['room_id', 'seat_row', 'seat_number'])
export class Seat extends CreatedAtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  room_id: string;

  @ManyToOne(() => Room, (room) => room.seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ type: 'varchar', length: 5 })
  seat_row: string;

  @Column({ type: 'int' })
  seat_number: number;

  @Column({
    type: 'enum',
    enum: SeatType,
    default: SeatType.STANDARD,
  })
  type: SeatType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0' })
  base_price: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0' })
  price_adjustment: string;

  @OneToMany(() => ShowtimeSeat, (showtimeSeat) => showtimeSeat.seat)
  showtime_seats: ShowtimeSeat[];

  @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.seat)
  booking_seats: BookingSeat[];
}
