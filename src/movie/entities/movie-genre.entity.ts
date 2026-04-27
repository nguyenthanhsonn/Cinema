import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Genre } from './genre.entity';
import { Movie } from './movie.entity';
import { TimestampedEntity } from 'src/common/entities/timestamped.entity';

@Entity('movie_genres')
export class MovieGenre extends TimestampedEntity {
  @PrimaryColumn('uuid')
  movie_id: string;

  @PrimaryColumn('uuid')
  genre_id: string;

  @ManyToOne(() => Movie, (movie) => movie.movie_genres, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Genre, (genre) => genre.movie_genres, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;
}
