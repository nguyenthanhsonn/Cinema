import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Showtime } from '../../showtime/entities/showtime.entity';
import { MovieAgeRating, MovieStatus } from '../enums/movie.enum';
import { MovieCast } from './movie-cast.entity';
import { MovieGenre } from './movie-genre.entity';
import { Review } from './review.entity';

@Entity('movies')
export class Movie extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  duration_minutes: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  poster_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  trailer_url: string | null;

  @Index()
  @Column({ type: 'varchar', length: 160, nullable: true })
  director: string | null;

  @Column({ type: 'date', nullable: true })
  start_date: string | null;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;

  @Column({ type: 'enum', enum: MovieAgeRating, nullable: true })
  age_rating: MovieAgeRating | null;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  audience_score: string | null;

  @Column({
    type: 'enum',
    enum: MovieStatus,
    default: MovieStatus.COMING_SOON,
  })
  @Index()
  status: MovieStatus;

  @OneToMany(() => MovieGenre, (movieGenre) => movieGenre.movie)
  movie_genres: MovieGenre[];

  @OneToMany(() => MovieCast, (movieCast) => movieCast.movie)
  movie_casts: MovieCast[];

  @OneToMany(() => Review, (review) => review.movie)
  reviews: Review[];

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes: Showtime[];

  @OneToMany(() => Booking, (booking) => booking.movie)
  bookings: Booking[];
}
