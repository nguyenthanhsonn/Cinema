import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Cinema } from '../../cinema/entities/cinema.entity';
import { Room } from '../../cinema/entities/room.entity';
import { Movie } from '../../movie/entities/movie.entity';
import { ShowtimeSeat } from './showtime-seat.entity';
import { ScreeningFormat, ShowtimeStatus } from '../enums/showtime.enum';

@Entity('showtimes')
export class Showtime extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  movie_id: string;

  @ManyToOne(() => Movie, (movie) => movie.showtimes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Index()
  @Column({ type: 'uuid' })
  cinema_id: string;

  @ManyToOne(() => Cinema, (cinema) => cinema.showtimes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cinema_id' })
  cinema: Cinema;

  @Index()
  @Column({ type: 'uuid' })
  room_id: string;

  @ManyToOne(() => Room, (room) => room.showtimes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Index()
  @Column({ type: 'date' })
  show_date: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({
    type: 'enum',
    enum: ScreeningFormat,
    default: ScreeningFormat.TWO_D,
  })
  format: ScreeningFormat;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: '0',
    transformer: {
      to: (val: number) => val,
      from: (val: string) => parseFloat(val),
    },
  })
  base_price: number;

  @Column({
    type: 'enum',
    enum: ShowtimeStatus,
    default: ShowtimeStatus.DRAFT,
  })
  @Index()
  status: ShowtimeStatus;

  @OneToMany(() => ShowtimeSeat, (showtimeSeat) => showtimeSeat.showtime)
  showtime_seats: ShowtimeSeat[];

  @OneToMany(() => Booking, (booking) => booking.showtime)
  bookings: Booking[];
}
