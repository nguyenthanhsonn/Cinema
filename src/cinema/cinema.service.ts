import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';
import { CinemaFeatureMap } from './entities/cinema-feature-map.entity';
import { CinemaFeature } from './entities/cinema-feature.entity';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { Seat } from './entities/seat.entity';

@Injectable()
export class CinemaService {
  constructor(
    @InjectRepository(Cinema)
    private readonly cinemaRepository: Repository<Cinema>,
  ) {}

  create(createCinemaDto: CreateCinemaDto) {
    const cinema = this.cinemaRepository.create(createCinemaDto as Partial<Cinema>);
    return this.cinemaRepository.save(cinema);
  }

  findAll() {
    return this.cinemaRepository.find({
      relations: ['rooms', 'cinema_feature_maps', 'staff_profiles'],
    });
  }

  async findOne(id: string) {
    const cinema = await this.cinemaRepository.findOne({
      where: { id },
      relations: ['rooms', 'cinema_feature_maps', 'showtimes', 'staff_profiles'],
    });

    if (!cinema) {
      throw new NotFoundException(`Cinema with id ${id} not found`);
    }

    return cinema;
  }

  async update(id: string, updateCinemaDto: UpdateCinemaDto) {
    const cinema = await this.findOne(id);
    this.cinemaRepository.merge(cinema, updateCinemaDto);
    return this.cinemaRepository.save(cinema);
  }

  async remove(id: string) {
    const cinema = await this.findOne(id);
    await this.cinemaRepository.remove(cinema);
    return { id, deleted: true };
  }
}
