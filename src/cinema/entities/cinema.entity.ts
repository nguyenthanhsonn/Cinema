import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Showtime } from '../../showtime/entities/showtime.entity';
import { StaffProfile } from '../../user/entities/staff-profile.entity';
import { CinemaStatus } from '../enums/cinema.enum';
import { CinemaFeatureMap } from './cinema-feature-map.entity';
import { Room } from './room.entity';

@Entity('cinemas')
export class Cinema extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  hotline: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng: string | null;

  @Column({
    type: 'enum',
    enum: CinemaStatus,
    default: CinemaStatus.ACTIVE,
  })
  @Index()
  status: CinemaStatus;

  @OneToMany(() => Room, (room) => room.cinema)
  rooms: Room[];

  @OneToMany(() => Showtime, (showtime) => showtime.cinema)
  showtimes: Showtime[];

  @OneToMany(() => Booking, (booking) => booking.cinema)
  bookings: Booking[];

  @OneToMany(() => CinemaFeatureMap, (featureMap) => featureMap.cinema)
  cinema_feature_maps: CinemaFeatureMap[];

  @OneToMany(() => StaffProfile, (staffProfile) => staffProfile.cinema)
  staff_profiles: StaffProfile[];
}
