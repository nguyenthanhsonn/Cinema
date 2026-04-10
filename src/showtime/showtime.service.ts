import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ShowtimeSeat } from './entities/showtime-seat.entity';
import { Showtime } from './entities/showtime.entity';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  create(createShowtimeDto: CreateShowtimeDto) {
    const showtime = this.showtimeRepository.create(
      createShowtimeDto as Partial<Showtime>,
    );
    return this.showtimeRepository.save(showtime);
  }

  findAll() {
    return this.showtimeRepository.find({
      relations: ['movie', 'cinema', 'room', 'showtime_seats'],
    });
  }

  async findOne(id: string) {
    const showtime = await this.showtimeRepository.findOne({
      where: { id },
      relations: ['movie', 'cinema', 'room', 'showtime_seats', 'bookings'],
    });

    if (!showtime) {
      throw new NotFoundException(`Showtime with id ${id} not found`);
    }

    return showtime;
  }

  async update(id: string, updateShowtimeDto: UpdateShowtimeDto) {
    const showtime = await this.findOne(id);
    this.showtimeRepository.merge(showtime, updateShowtimeDto);
    return this.showtimeRepository.save(showtime);
  }

  async remove(id: string) {
    const showtime = await this.findOne(id);
    await this.showtimeRepository.remove(showtime);
    return { id, deleted: true };
  }
}
