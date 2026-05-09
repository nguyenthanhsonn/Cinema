import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { ShowtimeSeat } from './entities/showtime-seat.entity';
import { Showtime } from './entities/showtime.entity';
import { MovieModule } from 'src/movie/movie.module';
import { Movie } from 'src/movie/entities/movie.entity';
import { Room } from 'src/cinema/entities/room.entity';
import { Seat } from 'src/cinema/entities/seat.entity';
import { Cinema } from 'src/cinema/entities/cinema.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime, ShowtimeSeat, Movie, Room, Seat, Cinema]), AuthModule, MovieModule],
  controllers: [ShowtimeController],
  providers: [ShowtimeService],
  exports: [TypeOrmModule, ShowtimeService],
})
export class ShowtimeModule { }
