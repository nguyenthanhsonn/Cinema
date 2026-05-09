import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemaController } from './cinema.controller';
import { CinemaService } from './cinema.service';
import { CinemaFeatureMap } from './entities/cinema-feature-map.entity';
import { CinemaFeature } from './entities/cinema-feature.entity';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { Seat } from './entities/seat.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cinema, CinemaFeature, CinemaFeatureMap, Room, Seat]),
    AuthModule, 
  ],
  controllers: [CinemaController],
  providers: [CinemaService],
  exports: [TypeOrmModule, CinemaService],
})
export class CinemaModule {}
