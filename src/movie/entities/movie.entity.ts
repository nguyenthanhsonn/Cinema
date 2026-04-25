import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
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

  @Column({ nullable: true })
  start_date: Date

  @Column({ nullable: true })
  end_date: Date

  @Column({ type: 'enum', enum: MovieAgeRating, nullable: true })
  age_rating: MovieAgeRating | null;

  // điểm đánh giá của khán giả
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
    transformer: {
      to: (val: number) => val,
      from: (val: string) => (val ? parseFloat(val) : null),
    },
  })
  audience_score: number | null;

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
}
