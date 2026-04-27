import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Actor } from './actor.entity';
import { Movie } from './movie.entity';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';

@Entity('movie_casts')
export class MovieCast extends TimestampedEntity{
  @PrimaryColumn('uuid')
  movie_id: string;

  @PrimaryColumn('uuid')
  actor_id: string;

  @ManyToOne(() => Movie, (movie) => movie.movie_casts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Actor, (actor) => actor.movie_casts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;

}
