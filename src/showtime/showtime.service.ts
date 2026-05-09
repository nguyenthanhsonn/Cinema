import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateShowtimeDto } from './dto/request/create-showtime.dto';
import { Showtime } from './entities/showtime.entity';
import { ShowtimeResponseDto } from './dto/response/showtime-response.dto';
import { Movie } from 'src/movie/entities/movie.entity';
import { Room } from 'src/cinema/entities/room.entity';
import { ShowtimeItemDto } from './dto/response/showtime-item.dto';
import { Seat } from 'src/cinema/entities/seat.entity';
import { ShowtimeSeat } from './entities/showtime-seat.entity';
import { ScreeningFormat, ShowtimeSeatStatus } from './enums/showtime.enum';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    private readonly dataSource: DataSource,
  ) { }


  private mapShowtime(showtime: Showtime, movie: Movie, room: Room): ShowtimeItemDto {
    return {
      id: showtime.id,
      movie_id: showtime.movie_id,
      movie_title: movie.title,
      cinema_id: showtime.cinema_id,
      cinema_name: room.cinema?.name ?? '',
      room_id: showtime.room_id,
      room_name: room.name,
      show_date: showtime.show_date,
      start_time: showtime.start_time,
      end_time: showtime.end_time,
      format: showtime.format,
      base_price: showtime.base_price,
      status: showtime.status,
      total_seats: room.total_seats,
      available_seats: room.total_seats,
    }
  }
  
  // Tạo xuất chiếu
  async createShowtimne(dto: CreateShowtimeDto) : Promise<ShowtimeResponseDto> {
    const movie = await this.movieRepo.findOne({where: {id: dto.movie_id}});
    if(!movie){
      throw new NotFoundException(`Không tìm thấy film`);
    }

    const room = await this.roomRepo.findOne({
      where: { id: dto.room_id },
      relations: { cinema: true },
    });
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chiếu');
    }

    const endTime = new Date(dto.start_time);
    endTime.setMinutes(endTime.getMinutes() + movie.duration_minutes);

    return this.dataSource.transaction(async (manager) => {
      const conflict = await manager
          .getRepository(Showtime)
          .createQueryBuilder('showtime')
          .where('showtime.room_id = :room_id', { room_id: dto.room_id })
          .andWhere('showtime.show_date = :show_date', { show_date: dto.show_date })
          .andWhere('showtime.start_time < :end_time AND showtime.end_time > :start_time', {
            start_time: new Date(dto.start_time),
            end_time: endTime,
          })
          .getOne();

      if(conflict){
        throw new BadRequestException('Phòng chiếu đã có lịch chiếu vào thời gian này');
      }

      const showtime = manager.create(Showtime, {
        movie_id: dto.movie_id,
        cinema_id: room.cinema_id,
        room_id: dto.room_id,
        show_date: dto.show_date,
        start_time: new Date(dto.start_time),
        end_time: endTime,
        format: dto.format,
        base_price: dto.base_price,
      });

      const savedShowtime = await manager.save(Showtime, showtime);
      const seats = await manager.getRepository(Seat).find({
        where: { room_id: dto.room_id },
      });

      // Mỗi suất chiếu cần một bản snapshot ghế riêng để giữ giá và trạng thái đặt vé độc lập theo thời điểm chiếu.
      const showtimeSeats = seats.map((seat) =>
        manager.create(ShowtimeSeat, {
          showtime_id: savedShowtime.id,
          seat_id: seat.id,
          price: dto.base_price + parseFloat(seat.price_adjustment),
          status: ShowtimeSeatStatus.AVAILABLE,
        }),
      );

      if (showtimeSeats.length > 0) {
        await manager.save(ShowtimeSeat, showtimeSeats);
      }

      return {
        success: true,
        data: {
          message: 'Tạo xuất chiếu thành công',
          showtime: this.mapShowtime(savedShowtime, movie, room),
        },
      };
    });
  }

  // Lấy danh sách định dạng xuất chiếu
  async getFormatShowtime(){
    return Object.values(ScreeningFormat).map((format) => {
      return {
        value: format,
        label: format
      };
    });
  }

  // Lấy danh sách xuất chiếu theo ngày
  async getShowtimesByDate(date: string, page = 1, limit = 10) : Promise<any> {

    // validate date & find date showtime
    const [showtimes, total] = await this.showtimeRepository.findAndCount({
      where: { show_date: new Date(date).toISOString() },
      relations: { movie: true, room: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        start_time: 'ASC'
      }
    });
    if(showtimes.length === 0){
      throw new BadRequestException('Không tìm thấy xuất chiếu');
    }
    // calculate total pages
    const totalPages = Math.ceil(total/limit);

    return {
      success: true,
      data: {
        message: 'Lấy danh sách xuất chiếu theo ngày thành công',
        showtimes: showtimes.map((showtime) => this.mapShowtime(showtime, showtime.movie, showtime.room)),
        total,
        page,
        limit,
        total_pages: totalPages,
        current_page: page,
        next_page: page < totalPages ? page + 1 : null,
        previous_page: page > 1 ? page - 1 : null,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
      },
    };
  }
}
