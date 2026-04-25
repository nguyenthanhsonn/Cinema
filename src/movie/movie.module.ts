import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { Actor } from './entities/actor.entity';
import { Genre } from './entities/genre.entity';
import { MovieCast } from './entities/movie-cast.entity';
import { MovieGenre } from './entities/movie-genre.entity';
import { Movie } from './entities/movie.entity';
import { Review } from './entities/review.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Genre, Actor, MovieGenre, MovieCast, Review]),
    AuthModule,
  ],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [TypeOrmModule, MovieService],
})
export class MovieModule {}
