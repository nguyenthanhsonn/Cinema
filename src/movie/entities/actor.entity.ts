import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MovieCast } from './movie-cast.entity';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';


@Entity('actors')
export class Actor extends TimestampedEntity{
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
