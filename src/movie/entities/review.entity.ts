import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, } from 'typeorm';
import { CreatedAtEntity } from '../../common/entities/created-at.entity';
import { User } from '../../user/entities/user.entity';
import { Movie } from './movie.entity';
import { Max, Min } from 'class-validator';

@Entity('reviews')

export class Review extends CreatedAtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ type: 'uuid' })
  movie_id: string;

  @ManyToOne(() => Movie, (movie) => movie.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Column({ type: 'int' })
  @Min(1)
  @Max(10)
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;
}
