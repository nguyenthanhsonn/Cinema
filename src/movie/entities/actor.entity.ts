import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MovieCast } from './movie-cast.entity';

@Entity('actors')
export class Actor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  img_url: string | null;

  @OneToMany(() => MovieCast, (movieCast) => movieCast.actor)
  movie_casts: MovieCast[];
}
