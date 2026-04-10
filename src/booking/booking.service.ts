import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingProduct } from './entities/booking-product.entity';
import { BookingSeat } from './entities/booking-seat.entity';
import { BookingStatusLog } from './entities/booking-status-log.entity';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  create(createBookingDto: CreateBookingDto) {
    const booking = this.bookingRepository.create(
      createBookingDto as Partial<Booking>,
    );
    return this.bookingRepository.save(booking);
  }

  findAll() {
    return this.bookingRepository.find({
      relations: [
        'user',
        'showtime',
        'room',
        'cinema',
        'movie',
        'booking_seats',
        'booking_products',
        'payment',
        'booking_status_logs',
        'notifications',
      ],
    });
  }

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'user',
        'showtime',
        'room',
        'cinema',
        'movie',
        'booking_seats',
        'booking_products',
        'payment',
        'booking_status_logs',
        'notifications',
      ],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);
    this.bookingRepository.merge(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  async remove(id: string) {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
    return { id, deleted: true };
  }
}
