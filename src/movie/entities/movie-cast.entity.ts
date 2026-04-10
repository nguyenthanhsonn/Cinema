import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Actor } from './actor.entity';
import { Movie } from './movie.entity';

@Entity('movie_casts')
export class MovieCast {
  @PrimaryColumn('uuid')
  movie_id: string;

  @Index()
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

  @Column({ type: 'varchar', length: 100, nullable: true })
  role_name: string | null;

  @Column({ type: 'int', default: 0 })
  display_order: number;
}
