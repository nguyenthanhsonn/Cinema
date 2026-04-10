import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { ShowtimeSeat } from './entities/showtime-seat.entity';
import { Showtime } from './entities/showtime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime, ShowtimeSeat])],
  controllers: [ShowtimeController],
  providers: [ShowtimeService],
  exports: [TypeOrmModule, ShowtimeService],
})
export class ShowtimeModule {}
