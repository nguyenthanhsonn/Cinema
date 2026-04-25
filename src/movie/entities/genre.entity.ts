import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MovieGenre } from './movie-genre.entity';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';

@Entity('genres')
export class Genre extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @OneToMany(() => MovieGenre, (movieGenre) => movieGenre.genre)
  movie_genres: MovieGenre[];
}
