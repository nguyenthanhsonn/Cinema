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
import { Booking } from '../../booking/entities/booking.entity';
import { Showtime } from '../../showtime/entities/showtime.entity';
import { ScreeningFormat } from '../../showtime/enums/showtime.enum';
import { RoomStatus } from '../enums/cinema.enum';
import { Cinema } from './cinema.entity';
import { Seat } from './seat.entity';

@Entity('rooms')
@Unique(['cinema_id', 'name'])
export class Room extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cinema_id: string;

  @ManyToOne(() => Cinema, (cinema) => cinema.rooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cinema_id' })
  cinema: Cinema;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({
    type: 'enum',
    enum: ScreeningFormat,
    default: ScreeningFormat.TWO_D,
  })
  format: ScreeningFormat;

  @Column({ type: 'int' })
  total_rows: number;

  @Column({ type: 'int' })
  total_columns: number;

  @Column({ type: 'int' })
  total_seats: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.ACTIVE,
  })
  @Index()
  status: RoomStatus;

  @OneToMany(() => Seat, (seat) => seat.room)
  seats: Seat[];

  @OneToMany(() => Showtime, (showtime) => showtime.room)
  showtimes: Showtime[];

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
