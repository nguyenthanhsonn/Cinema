import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { CreateShowtimeDto } from './dto/request/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/request/update-showtime.dto';
import { Showtime } from './entities/showtime.entity';
import { ShowtimeResponseDto } from './dto/response/showtime-response.dto';
import { Movie } from 'src/movie/entities/movie.entity';
import { Room } from 'src/cinema/entities/room.entity';
import { ShowtimeItemDto } from './dto/response/showtime-item.dto';
import { Seat } from 'src/cinema/entities/seat.entity';
import { ShowtimeSeat } from './entities/showtime-seat.entity';
import { ScreeningFormat, ScheduleType, ShowtimeSeatStatus, ShowtimeStatus } from './enums/showtime.enum';
import { MovieService } from 'src/movie/movie.service';
import { Booking } from 'src/booking/entities/booking.entity';
import { CinemaService } from 'src/cinema/cinema.service';
import { GetDraftShowtimesDto } from './dto/request/get-draft-showtime.dto';
import { PublishShowtimeResponseDto } from './dto/response/public-showtime.dto';
import { PublishAllShowtimeDraftByDateResponseDto } from './dto/response/publish-all-showtime.dto';
import { ShowtimeSeatItemDto } from './dto/response/showtime-seat-item.dto';
import { LockSeatsDto } from './dto/request/lock-seats.dto';
import { ReleaseSeatsDto } from './dto/request/release-seats.dto';
import { GetShowtimeByWeekDto } from './dto/request/get-showtime-by-week.dto';


@Injectable()
export class ShowtimeService {
  private readonly logger = new Logger(ShowtimeService.name);

  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(ShowtimeSeat)
    private readonly showtimeSeatRepository: Repository<ShowtimeSeat>,
    private readonly dataSource: DataSource,
    private readonly movieService: MovieService,
    private readonly cinemaService: CinemaService,
  ) { }

  private readonly ADS_TIME = 10; // quảng cáo
  private readonly CLEANING_TIME = 15; // vệ sinh
  private readonly STANDARD_SEAT_PRICE = 55000;

  /** Tính toán giá vé cơ bản dựa trên định dạng phòng (3D, IMAX) và khung giờ vàng */
  private calculateBasePrice(
    format: ScreeningFormat,
    startTime: Date,
  ): number {
    return this.STANDARD_SEAT_PRICE;
  }


  private mapShowtime(showtime: Showtime, movie: Movie, room: Room): ShowtimeItemDto {
    return {
      id: showtime.id,
      movie_id: showtime.movie_id,
      movie_title: movie.title,
      movie_poster: movie.poster_url ?? undefined,
      movie_duration_minutes: movie.duration_minutes,
      room_id: showtime.room_id,
      room_name: room.name,
      show_date: showtime.show_date,
      start_time: showtime.start_time.toISOString(),
      end_time: showtime.end_time.toISOString(),
      format: showtime.format,
      base_price: showtime.base_price,
      status: showtime.status,
      schedule_type: showtime.schedule_type,
      total_seats: room.total_seats,
      available_seats:
        (showtime.showtime_seats ?? []).filter(
          (ss) => ss.status === ShowtimeSeatStatus.AVAILABLE,
        ).length,
    }
  }

  // tính thứ 2 của tuần hiện tại
  private getMonday(date: Date): Date {
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(date);
    monday.setDate(monday.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /** Lấy danh sách ghế của một suất chiếu cụ thể kèm theo trạng thái và giá */
  async getShowtimeSeats(showtimeId: string): Promise<ShowtimeSeatItemDto[]> {
    const showtimeSeats = await this.showtimeSeatRepository.find({
      where: { showtime_id: showtimeId },
      relations: { seat: true },
      order: {
        seat: {
          seat_row: 'ASC',
          seat_number: 'ASC',
        },
      },
    });

    const now = new Date();

    return showtimeSeats.map((ss) => {
      let status = ss.status;
      // Nếu ghế đang bị lock nhưng đã hết hạn thì xem như Available
      if (status === ShowtimeSeatStatus.LOCKED && ss.lock_expires_at && ss.lock_expires_at < now) {
        status = ShowtimeSeatStatus.AVAILABLE;
      }

      return {
        id: ss.id,
        showtime_id: ss.showtime_id,
        seat_id: ss.seat_id,
        seat_row: ss.seat.seat_row,
        seat_number: ss.seat.seat_number,
        type: ss.seat.type,
        price: ss.price,
        status: status,
      };
    });
  }

  /** Khóa ghế tạm thời (mặc định 5 phút) để chờ thanh toán */
  async lockSeats(showtimeId: string, userId: string, dto: LockSeatsDto): Promise<boolean> {
    const LOCK_MINUTES = 5;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + LOCK_MINUTES);

    return this.dataSource.transaction(async (manager) => {
      // Sử dụng Pessimistic Write Lock để ngăn các transaction khác đọc/ghi vào các dòng này cho đến khi xong
      const showtimeSeats = await manager.createQueryBuilder(ShowtimeSeat, 'ss')
        .setLock('pessimistic_write')
        .where('ss.id IN (:...ids)', { ids: dto.showtime_seat_ids })
        .andWhere('ss.showtime_id = :showtimeId', { showtimeId })
        // Dùng INNER JOIN để tránh lỗi Postgres khi FOR UPDATE đi kèm LEFT JOIN.
        .innerJoinAndSelect('ss.seat', 'seat')
        .getMany();

      if (showtimeSeats.length !== dto.showtime_seat_ids.length) {
        throw new BadRequestException('Một số ghế không tồn tại hoặc không thuộc suất chiếu này');
      }

      const now = new Date();

      for (const ss of showtimeSeats) {
        // Kiểm tra xem ghế đã có người khác giữ và chưa hết hạn không
        const isLockedByOthers =
          ss.status === ShowtimeSeatStatus.LOCKED &&
          ss.locked_by_user_id !== userId &&
          ss.lock_expires_at && ss.lock_expires_at > now;

        if (ss.status === ShowtimeSeatStatus.SOLD || ss.status === ShowtimeSeatStatus.RESERVED || isLockedByOthers) {
          throw new BadRequestException(`Ghế hàng ${ss.seat.seat_row} số ${ss.seat.seat_number} đã có người chọn`);
        }

        ss.status = ShowtimeSeatStatus.LOCKED;
        ss.locked_by_user_id = userId;
        ss.lock_expires_at = expiresAt;
      }

      await manager.save(ShowtimeSeat, showtimeSeats);
      return true;
    });
  }

  /** Giải phóng các ghế đang bị khóa bởi chính người dùng */
  async releaseSeats(showtimeId: string, userId: string, dto: ReleaseSeatsDto): Promise<boolean> {
    const showtimeSeats = await this.showtimeSeatRepository.find({
      where: {
        id: In(dto.showtime_seat_ids),
        showtime_id: showtimeId,
        locked_by_user_id: userId,
        status: ShowtimeSeatStatus.LOCKED,
      },
    });

    if (showtimeSeats.length > 0) {
      for (const ss of showtimeSeats) {
        ss.status = ShowtimeSeatStatus.AVAILABLE;
        ss.locked_by_user_id = null;
        ss.lock_expires_at = null;
      }
      await this.showtimeSeatRepository.save(showtimeSeats);
    }

    return true;
  }

/** Tự động quét và giải phóng các ghế đã hết hạn khóa (LOCKED) mỗi phút */
@Cron(CronExpression.EVERY_MINUTE)
async handleCronSeatsCleanup() {
  const now = new Date();
  const result = await this.showtimeSeatRepository
    .createQueryBuilder()
    .update(ShowtimeSeat)
    .set({
      status: ShowtimeSeatStatus.AVAILABLE,
      locked_by_user_id: null,
      lock_expires_at: null
    } as any)
    .where("status = :status", { status: ShowtimeSeatStatus.LOCKED })
    .andWhere("lock_expires_at < :now", { now })
    .execute();

  if (result.affected && result.affected > 0) {
    this.logger.log(`Released ${result.affected} expired seat locks`);
  }
}

/** YYYY-MM-DD theo timezone local (tránh lệch ngày khi dùng toISOString UTC). */
  private formatLocalDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseLocalDate(date?: string): Date {
    if (!date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }

    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private getDayLabel(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = this.formatLocalDateString(date);
    if (dateString === this.formatLocalDateString(today)) return 'Hôm nay';
    if (dateString === this.formatLocalDateString(tomorrow)) return 'Ngày mai';

    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return weekdays[date.getDay()];
  }

  // tính độ hot của phim
  private calculateHotScore(movie: Movie, bookingCount: number): number {
    // nếu không có booking thì tính theo expected_hot_score và admin_priority
    if (bookingCount === 0) {
      return (movie.expected_hot_score ?? 3) * 0.6 + movie.admin_priority * 0.4;
    }
    return bookingCount * 0.5 + (movie.audience_score ?? 5) * 0.3 + movie.admin_priority * 0.2;
  }

  /** Tạo một suất chiếu thủ công (MANUAL) */
  async createShowtimne(dto: CreateShowtimeDto): Promise<ShowtimeResponseDto> {
    const movie = await this.movieRepo.findOne({ where: { id: dto.movie_id } });
    if (!movie) {
      throw new NotFoundException(`Không tìm thấy film`);
    }

    const room = await this.roomRepo.findOne({
      where: { id: dto.room_id },
      relations: { cinema: true },
    });
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chiếu');
    }

    // Thời gian kết thúc = movie duration + ads + cleaning
    const totalDuration = movie.duration_minutes + this.ADS_TIME + this.CLEANING_TIME;
    const endTime = new Date(dto.start_time);
    endTime.setMinutes(endTime.getMinutes() + totalDuration);

    return this.dataSource.transaction(async (manager) => {
      const basePrice = this.STANDARD_SEAT_PRICE;
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

      if (conflict) {
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
        base_price: basePrice,
        schedule_type: ScheduleType.MANUAL,
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
          price: basePrice + parseFloat(seat.price_adjustment),
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

  /**
   * Cập nhật một suất chiếu **nháp** (`DRAFT`) theo `id`.
   *
   * - Chỉ cho phép sửa suất **DRAFT**; đã publish (`ON_SALE`…) thì không vào đây.
   * - Body là **partial** (`UpdateShowtimeDto`): field không gửi giữ nguyên giá trị cũ.
   * - `end_time` luôn tính lại: `start_time` + (độ dài phim + quảng cáo + vệ sinh), giống lúc tạo suất.
   * - Trùng lịch: kiểm tra **cùng phòng**, **cùng ngày**, khung thời gian giao nhau — **bỏ qua chính bản ghi đang sửa** (`st.id != :id`).
   * - Đổi **phòng**: xóa toàn bộ `showtime_seats` cũ, tạo lại snapshot ghế theo phòng mới.
   * - Giữ nguyên phòng chỉ đổi **base_price**: chỉnh lại `price` từng ghế (`base_price` + `price_adjustment` của ghế).
   */
  async updateShowtimeDraft(id: string, dto: UpdateShowtimeDto): Promise<ShowtimeResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      // Chỉ load suất nháp + quan hệ phục vụ map/ghế
      const existing = await manager.findOne(Showtime, {
        where: { id, status: ShowtimeStatus.DRAFT },
        relations: { movie: true, room: { cinema: true }, showtime_seats: true },
      });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy xuất chiếu nháp');
      }

      const prevRoomId = existing.room_id;

      // Gộp DTO partial với trạng thái hiện tại
      const movieId = dto.movie_id ?? existing.movie_id;
      const roomId = dto.room_id ?? existing.room_id;
      const show_date = dto.show_date ?? existing.show_date;
      const start_time = dto.start_time
        ? new Date(dto.start_time)
        : new Date(existing.start_time);
      const format = dto.format ?? existing.format;
      const base_price = this.STANDARD_SEAT_PRICE;

      // Tránh lệch ngày: show_date (cột date) phải khớp ngày calendar của start_time (local server)
      if (dto.start_time !== undefined || dto.show_date !== undefined) {
        const expectedDate = this.formatLocalDateString(start_time);
        if (show_date !== expectedDate) {
          throw new BadRequestException(
            'show_date phải trùng ngày của start_time (timezone máy chủ)',
          );
        }
      }

      const movie = await manager.findOne(Movie, { where: { id: movieId } });
      if (!movie) {
        throw new NotFoundException('Không tìm thấy phim');
      }

      const room = await manager.findOne(Room, {
        where: { id: roomId },
        relations: { cinema: true },
      });
      if (!room) {
        throw new NotFoundException('Không tìm thấy phòng chiếu');
      }

      const totalDuration =
        movie.duration_minutes + this.ADS_TIME + this.CLEANING_TIME;
      const endTime = new Date(start_time);
      endTime.setMinutes(endTime.getMinutes() + totalDuration);

      // Trùng slot trên cùng phòng / ngày (không tính suất đang patch)
      const conflict = await manager
        .getRepository(Showtime)
        .createQueryBuilder('st')
        .where('st.room_id = :room_id', { room_id: roomId })
        .andWhere('st.show_date = :show_date', { show_date })
        .andWhere('st.id != :id', { id })
        .andWhere(
          'st.start_time < :end_time AND st.end_time > :start_time',
          { start_time, end_time: endTime },
        )
        .getOne();

      if (conflict) {
        throw new BadRequestException(
          'Phòng chiếu đã có lịch chiếu vào thời gian này',
        );
      }

      existing.movie_id = movieId;
      existing.cinema_id = room.cinema_id;
      existing.room_id = roomId;
      existing.show_date = show_date;
      existing.start_time = start_time;
      existing.end_time = endTime;
      existing.format = format;
      existing.base_price = base_price;

      await manager.save(Showtime, existing);

      const roomChanged = roomId !== prevRoomId;

      // Đổi phòng → bộ ghế snapshot không còn đúng → xóa cũ, tạo mới theo phòng
      if (roomChanged) {
        await manager.delete(ShowtimeSeat, { showtime_id: id });
        const seats = await manager.find(Seat, { where: { room_id: roomId } });
        const rows = seats.map((seat) =>
          manager.create(ShowtimeSeat, {
            showtime_id: id,
            seat_id: seat.id,
            price: base_price + parseFloat(seat.price_adjustment),
            status: ShowtimeSeatStatus.AVAILABLE,
          }),
        );
        if (rows.length > 0) {
          await manager.save(ShowtimeSeat, rows);
        }
      } else if (dto.base_price !== undefined) {
        // Cùng phòng, chỉ đổi giá vé cơ bản → cập nhật giá từng ghế đã snapshot
        const sts = await manager.find(ShowtimeSeat, {
          where: { showtime_id: id },
        });
        const seatIds = sts.map((s) => s.seat_id);
        if (seatIds.length > 0) {
          const seats = await manager.find(Seat, {
            where: { id: In(seatIds) },
          });
          const seatById = new Map(seats.map((s) => [s.id, s]));
          for (const st of sts) {
            const seat = seatById.get(st.seat_id);
            if (seat) {
              st.price = base_price + parseFloat(seat.price_adjustment);
            }
          }
          await manager.save(ShowtimeSeat, sts);
        }
      }

      // Load lại kèm ghế để map `available_seats` / response đầy đủ
      const updated = await manager.findOne(Showtime, {
        where: { id },
        relations: { movie: true, room: { cinema: true }, showtime_seats: true },
      });
      if (!updated) {
        throw new NotFoundException('Không tìm thấy xuất chiếu sau khi cập nhật');
      }

      return {
        success: true,
        data: {
          message: 'Cập nhật xuất chiếu nháp thành công',
          showtime: this.mapShowtime(updated, updated.movie, updated.room),
        },
      };
    });
  }

  /** Xóa một suất **DRAFT**. Suất đã publish không cho xóa (tránh mất dữ liệu vé). */
  async deleteShowtimeDraft(id: string): Promise<{ success: boolean; data: { message: string; }; }> {
    const showtime = await this.showtimeRepository.findOne({ where: { id, status: ShowtimeStatus.DRAFT } });
    if (!showtime) {
      throw new NotFoundException('Không tìm thấy xuất chiếu');
    }
    if (showtime.status !== ShowtimeStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ được xóa suất nháp (DRAFT)',
      );
    }
    await this.showtimeRepository.delete(id);
    return {
      success: true,
      data: {
        message: 'Đã xóa xuất chiếu nháp',
      },
    };
  }

  // Lấy danh sách định dạng xuất chiếu
  async getFormatShowtime() {
    return Object.values(ScreeningFormat).map((format) => {
      return {
        value: format,
        label: format
      };
    });
  }

  // Lấy danh sách xuất chiếu theo ngày
  async getShowtimesByDate(date: string, page = 1, limit = 10): Promise<any> {

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
    // Trả mảng rỗng + total: 0 để FE render trang trống, không throw
    // calculate total pages
    const totalPages = Math.ceil(total / limit);

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

  async getShowtimeByWeek(query: GetShowtimeByWeekDto): Promise<any> {
    type WeekShowtimeItem = {
      id: string;
      start_time: string;
      room_name: string;
      format: ScreeningFormat;
      base_price: number;
      available_seats: number;
    };
    type WeekMovieItem = {
      movie_id: string;
      movie_title: string;
      poster_url: string | null;
      duration_minutes: number;
      age_rating: Movie['age_rating'];
      release_date: string | null;
      showtimes: WeekShowtimeItem[];
    };
    type WeekDayItem = {
      date: string;
      label: string;
      movies: WeekMovieItem[];
    };

    const weekStartDate = this.getMonday(this.parseLocalDate(query.date));
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const weekStart = this.formatLocalDateString(weekStartDate);
    const weekEnd = this.formatLocalDateString(weekEndDate);

    const days: WeekDayItem[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + index);

      return {
        date: this.formatLocalDateString(date),
        label: this.getDayLabel(date),
        movies: [],
      };
    });

    const dayByDate = new Map(days.map((day) => [day.date, day]));

    const showtimes = await this.showtimeRepository.find({
      where: {
        show_date: Between(weekStart, weekEnd),
        status: ShowtimeStatus.ON_SALE,
      },
      relations: {
        movie: true,
        room: true,
        showtime_seats: true,
      },
      order: {
        show_date: 'ASC',
        start_time: 'ASC',
      },
    });

    const movieMapsByDate = new Map<string, Map<string, WeekMovieItem>>();

    for (const showtime of showtimes) {
      const showDate =
        typeof showtime.show_date === 'string'
          ? showtime.show_date
          : this.formatLocalDateString(new Date(showtime.show_date));
      const day = dayByDate.get(showDate);
      if (!day || !showtime.movie || !showtime.room) continue;

      if (!movieMapsByDate.has(showDate)) {
        movieMapsByDate.set(showDate, new Map());
      }

      const movieMap = movieMapsByDate.get(showDate)!;
      if (!movieMap.has(showtime.movie_id)) {
        const movieItem = {
          movie_id: showtime.movie_id,
          movie_title: showtime.movie.title,
          poster_url: showtime.movie.poster_url,
          duration_minutes: showtime.movie.duration_minutes,
          age_rating: showtime.movie.age_rating,
          release_date: showtime.movie.start_date
            ? this.formatLocalDateString(new Date(showtime.movie.start_date))
            : null,
          showtimes: [],
        };

        movieMap.set(showtime.movie_id, movieItem);
        day.movies.push(movieItem);
      }

      const movieItem = movieMap.get(showtime.movie_id);
      if (!movieItem) continue;

      movieItem.showtimes.push({
        id: showtime.id,
        start_time: this.formatTime(new Date(showtime.start_time)),
        room_name: showtime.room.name,
        format: showtime.format,
        base_price: showtime.base_price,
        available_seats: (showtime.showtime_seats ?? []).filter((seat) => {
          if (seat.status === ShowtimeSeatStatus.AVAILABLE) return true;
          return (
            seat.status === ShowtimeSeatStatus.LOCKED &&
            !!seat.lock_expires_at &&
            seat.lock_expires_at < new Date()
          );
        }).length,
      });
    }

    return {
      success: true,
      data: {
        week_start: weekStart,
        week_end: weekEnd,
        days,
      },
    };
  }

  /**
   * Sinh lịch chiếu nháp (DRAFT) cho **một tuần** (Thứ Hai → Chủ Nhật của tuần chứa “hôm nay”).
   *
   * Luồng nghiệp vụ:
   * 1. Lấy phim đang chiếu → entity đầy đủ (duration + hot).
   * 2. Đếm booking 7 ngày → `calculateHotScore` → sort **hot giảm dần**.
   * 3. Lấy **tất cả** phòng active có ghế (`In(ids)` + `seats`); `cinema` để map response.
   * 4. **Mỗi ngày × mỗi phòng**: một timeline riêng — `while (currentTime < dayEndTime)` lấp đầy ngày bằng suất chiếu.
   * 5. Thuật toán tham lam (greedy) được áp dụng ở bước chọn phim cho từng slot:
   *    - Tại mỗi slot hiện tại, hệ thống chọn từ tập phim "tốt nhất tại thời điểm đó" thay vì tối ưu lại toàn bộ tuần.
   *    - Danh sách phim đã sort theo `hot_score`, nên phim hot/ưu tiên cao đứng trước.
   *    - Trước hết lọc phim phù hợp định dạng phòng (`room.format` ∈ `movie.supported_formats`).
   *    - Nếu là giờ vàng 18h-22h, chỉ lấy top 50% phim hot nhất để tăng xác suất xếp phim mạnh vào khung đẹp.
   *    - Trong tập ứng viên đã lọc, chọn ngẫu nhiên nhẹ để lịch bớt lặp cứng nhưng vẫn nghiêng về phim hot.
   * 6. Nếu suất được chọn vừa với giờ đóng cửa và không trùng lịch cùng phòng thì lưu draft ngay.
   * 7. Sau mỗi suất thành công: `currentTime = endTime + randomBreak(5-15 phút)`.
   *
   * Đây là greedy theo slot/phòng/ngày: mỗi quyết định dùng thông tin tốt nhất hiện có
   * (hot score, format, prime time, conflict) và chốt ngay, không backtracking.
   * `show_date` dùng `formatLocalDateString` (local), không `toISOString().slice(0,10)` (UTC).
   */
  async generateShowtimeSchedule() {
    const START_HOUR = 9;
    const END_HOUR = 23;

    const monday = this.getMonday(new Date());
    const dates = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(day.getDate() + i);
      return day;
    });

    const movies = await this.movieService.getShowingMovies();
    if (movies.data.movies.length === 0) {
      throw new BadRequestException('Không có phim đang chiếu');
    }

    const movieDtos = movies.data.movies;
    const movieEntities = await this.movieRepo.findBy({
      id: In(movieDtos.map((m) => m.id)),
    });
    const movieById = new Map(movieEntities.map((m) => [m.id, m]));

    // Đếm số booking theo từng phim (7 ngày gần nhất) để tính hot score.
    // Lưu ý: bảng bookings **không có** cột movie_id — phim gắn với suất chiếu qua booking.showtime_id → showtimes.movie_id.
    const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const bookingCountsRaw = await this.dataSource
      .getRepository(Booking)
      .createQueryBuilder('booking')
      .innerJoin('booking.showtime', 'showtime')
      .select('showtime.movie_id', 'movie_id')
      .addSelect('COUNT(booking.id)', 'count')
      .where('booking.created_at >= :since', { since: sinceDate })
      .groupBy('showtime.movie_id')
      .getRawMany();

    const bookingCountMap = new Map<string, number>(
      bookingCountsRaw.map((item) => [item.movie_id, Number(item.count)]),
    );

    const movieBookingCounts = movieDtos.map((dto) => {
      const movie = movieById.get(dto.id);
      if (!movie) {
        throw new NotFoundException(`Không tìm thấy phim với id ${dto.id}`);
      }
      const count = bookingCountMap.get(movie.id) || 0;
      return {
        movie,
        hot_score: this.calculateHotScore(movie, count),
      };
    });

    // Greedy foundation: sort phim theo độ ưu tiên giảm dần một lần.
    // Các slot sau đó luôn chọn từ danh sách đã xếp hạng này, nên phim hot có lợi thế tự nhiên.
    movieBookingCounts.sort((a, b) => b.hot_score - a.hot_score);

    const rooms = await this.cinemaService.getAllActiveRooms();
    if (rooms.data.rooms.length === 0) {
      throw new BadRequestException('Không có phòng chiếu đang active');
    }

    const roomIds = rooms.data.rooms.map((r) => r.id);
    const roomsFromDb = await this.roomRepo.find({
      where: { id: In(roomIds) },
      relations: ['seats', 'cinema'],
    });
    const roomById = new Map(roomsFromDb.map((r) => [r.id, r]));
    const schedulingRooms = roomIds
      .map((id) => roomById.get(id))
      .filter((r): r is Room => !!r && !!r.seats?.length);

    if (schedulingRooms.length === 0) {
      const loadedIds = new Set(roomsFromDb.map((r) => r.id));
      const missingInDb = roomIds.filter((id) => !loadedIds.has(id));
      const noSeats = roomsFromDb.filter((r) => !r.seats?.length).map((r) => r.id);

      let hint =
        'Cần ít nhất một phòng active đã có dữ liệu ghế trong bảng seats (tạo layout ghế cho phòng trước).';
      if (missingInDb.length > 0) {
        hint = `Một số phòng không tìm thấy trong DB (id: ${missingInDb.slice(0, 3).join(', ')}${missingInDb.length > 3 ? '…' : ''}).`;
      } else if (noSeats.length > 0) {
        hint = `Các phòng sau chưa có ghế (bảng seats trống): ${noSeats.slice(0, 5).join(', ')}${noSeats.length > 5 ? '…' : ''}. Hãy import/tạo ghế cho phòng rồi generate lại.`;
      }

      throw new BadRequestException(
        `Không có phòng kèm ghế để tạo lịch chiếu. ${hint}`,
      );
    }

    let totalCreated = 0;
    const generatedShowtimes: ShowtimeItemDto[] = [];
    await this.dataSource.transaction(async (manager) => {
      for (const date of dates) {
        const showDateStr = this.formatLocalDateString(date);

        for (const room of schedulingRooms) {
          // #2. Không generate trùng tuần/ngày nếu đã có dữ liệu
          const existed = await manager.exists(Showtime, {
            where: {
              show_date: showDateStr,
              room_id: room.id,
            },
          });
          if (existed) continue;

          let currentTime = new Date(date);
          currentTime.setHours(START_HOUR, 0, 0, 0);

          const dayEndTime = new Date(date);
          dayEndTime.setHours(END_HOUR, 0, 0, 0);

          while (currentTime < dayEndTime) {
            // Greedy decision cho slot hiện tại:
            // thay vì thử mọi tổ hợp lịch trong ngày/tuần, ta chọn phim tốt nhất cho đúng slot này.
            // "Tốt nhất" được hiểu theo: đúng format phòng, ưu tiên hot score, và ưu tiên mạnh hơn vào giờ vàng.
            const hour = currentTime.getHours();
            const isPrimeTime = hour >= 18 && hour <= 22;

            // Bước 1: lọc phim theo năng lực phòng.
            // Ví dụ phòng IMAX ưu tiên phim có supported_formats chứa "imax".
            let eligibleMovies = movieBookingCounts.filter((m) => {
              // Phim phải hỗ trợ định dạng của phòng
              return m.movie.supported_formats?.includes(room.format as ScreeningFormat);
            });

            // Fallback: nếu phòng có format đặc biệt nhưng chưa có phim khai báo format đó,
            // vẫn cho phép lấy toàn bộ phim để không bỏ trống timeline của phòng.
            if (eligibleMovies.length === 0) {
              eligibleMovies = movieBookingCounts;
            }

            // Bước 2: giờ vàng là tài nguyên có giá trị cao, nên greedy thu hẹp ứng viên
            // còn top 50% phim hot nhất. Nhờ danh sách đã sort, `slice(0, topCount)`
            // chính là nhóm phim có lợi ích kỳ vọng cao nhất cho slot hiện tại.
            let candidates = eligibleMovies;
            if (isPrimeTime) {
              // Giờ vàng ưu tiên top phim hot (50% danh sách đã sort)
              const topCount = Math.max(1, Math.ceil(eligibleMovies.length * 0.5));
              candidates = eligibleMovies.slice(0, topCount);
            }

            // Bước 3: chọn ngẫu nhiên nhẹ trong tập ứng viên greedy.
            // Điều này tránh lịch bị lặp một phim liên tục, nhưng vẫn giữ ràng buộc "ưu tiên phim hot".
            const selectedEntry = candidates[Math.floor(Math.random() * candidates.length)];
            const movie = selectedEntry.movie;

            const totalDuration = movie.duration_minutes + this.ADS_TIME + this.CLEANING_TIME;
            const endTime = new Date(currentTime);
            endTime.setMinutes(endTime.getMinutes() + totalDuration);

            if (endTime > dayEndTime) {
              break;
            }

            const conflict = await manager
              .getRepository(Showtime)
              .createQueryBuilder('showtime')
              .where('showtime.room_id = :room_id', { room_id: room.id })
              .andWhere('showtime.show_date = :show_date', {
                show_date: showDateStr,
              })
              .andWhere(
                'showtime.start_time < :end_time AND showtime.end_time > :start_time',
                {
                  start_time: currentTime,
                  end_time: endTime,
                },
              )
              .getOne();

            if (conflict) {
              // Nếu có conflict (do lịch thủ công chẳng hạn), nhảy tới mốc tiếp theo
              currentTime.setMinutes(currentTime.getMinutes() + 30);
              continue;
            }

            const saved = await manager.save(Showtime, {
              movie_id: movie.id,
              cinema_id: room.cinema_id,
              room_id: room.id,
              show_date: showDateStr,
              start_time: currentTime,
              end_time: endTime,
              format: room.format,
              base_price: this.calculateBasePrice(room.format, currentTime),
              status: ShowtimeStatus.DRAFT,
              schedule_type: ScheduleType.AUTO,
            });

            const showtimeSeats = room.seats.map((seat) =>
              manager.create(ShowtimeSeat, {
                showtime_id: saved.id,
                seat_id: seat.id,
                price: this.calculateBasePrice(room.format, currentTime) + parseFloat(seat.price_adjustment),
                status: ShowtimeSeatStatus.AVAILABLE,
              }),
            );
            if (showtimeSeats.length > 0) {
              await manager.save(ShowtimeSeat, showtimeSeats);
            }

            generatedShowtimes.push(this.mapShowtime(saved, movie, room));
            totalCreated++;

            // Tiếp tục slot tiếp theo
            currentTime = new Date(endTime);
            // #3. Random nhẹ: Nghỉ thêm 5-15 phút ngẫu nhiên cho lịch "tự nhiên"
            const randomBreak = Math.floor(Math.random() * 11) + 5;
            currentTime.setMinutes(currentTime.getMinutes() + randomBreak);
          }
        }
      }
    });

    return {
      success: true,
      data: {
        message: 'Tạo lịch chiếu tự động thành công',
        total_created: totalCreated,
        showtimes: generatedShowtimes,
      },
    };
  }

  // get showtime draft
  async getShowtimeDraft(query: GetDraftShowtimesDto): Promise<any> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: any = {
      status: ShowtimeStatus.DRAFT
    }
    if (query.date) {
      where.show_date = query.date;
    }
    const [showtimes, total] = await this.showtimeRepository.findAndCount({
      where,
      relations: { movie: true, room: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        start_time: 'ASC'
      }
    });
    // Không có nháp → showtimes: [], total: 0 (không NotFound)
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data: {
        message: 'Lấy danh sách xuất chiếu nháp thành công',
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

  // public 1 suất chiếu nháp
  async publishShowtimeDraft(id: string): Promise<PublishShowtimeResponseDto> {
    const showtime = await this.showtimeRepository.findOne({ where: { id, status: ShowtimeStatus.DRAFT }, relations: { movie: true, room: true } });
    if (!showtime) {
      throw new NotFoundException('Không tìm thấy xuất chiếu nháp');
    }
    showtime.status = ShowtimeStatus.ON_SALE;
    const savedShowtime = await this.showtimeRepository.save(showtime);
    return {
      success: true,
      data: {
        message: `Xuất chiếu nháp có id ${savedShowtime.id} đã được publish`,
        showtime: this.mapShowtime(savedShowtime, savedShowtime.movie, savedShowtime.room),
      }
    }
  }

  /** Public toàn bộ lịch nháp (DRAFT -> ON_SALE) sử dụng transaction */
  async publishAllShowtimeDrafts(): Promise<PublishAllShowtimeDraftByDateResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const showtimes = await manager.find(Showtime, {
        where: { status: ShowtimeStatus.DRAFT },
        relations: { movie: true, room: true },
      });

      if (showtimes.length === 0) {
        return {
          success: true,
          data: {
            message: 'Không có suất nháp nào để publish',
            total_published: 0,
            showtimes: [],
          },
        };
      }

      for (const st of showtimes) {
        st.status = ShowtimeStatus.ON_SALE;
      }

      const updatedShowtimes = await manager.save(Showtime, showtimes);

      return {
        success: true,
        data: {
          message: `Đã publish ${updatedShowtimes.length} suất nháp`,
          total_published: updatedShowtimes.length,
          showtimes: updatedShowtimes.map((st) =>
            this.mapShowtime(st, st.movie, st.room),
          ),
        },
      };
    });
  }

  // get danh
}
