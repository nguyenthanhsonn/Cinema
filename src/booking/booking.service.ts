import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/response/booking-detail-response.dto';
import { Booking } from './entities/booking.entity';
import { Showtime } from 'src/showtime/entities/showtime.entity';
import { ShowtimeSeat } from 'src/showtime/entities/showtime-seat.entity';
import { ShowtimeSeatStatus } from 'src/showtime/enums/showtime.enum';
import { BookingStatus } from './enums/booking.enum';
import { BookingSeat } from './entities/booking-seat.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentProvider, PaymentStatus } from 'src/payment/enums/payment.enum';
import { PaymentService } from 'src/payment/payment.service';
import { TicketService } from 'src/ticket/ticket.service';
import { GetBookingResponseDto } from './dto/response/get-booking-res.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentService,
    private readonly ticketService: TicketService,
  ) { }

  /** Tạo một giao dịch đặt vé (Booking). Ghế phải đã LOCKED bởi user; không chuyển SOLD tại bước này. */
  async create(userId: string | null, dto: CreateBookingDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Kiểm tra showtime tồn tại
      const showtime = await manager.findOne(Showtime, {
        where: { id: dto.showtime_id },
        relations: { room: { cinema: true } },
      });
      if (!showtime) throw new NotFoundException('Không tìm thấy suất chiếu');

      if (!userId) {
        throw new BadRequestException('Yêu cầu đăng nhập để đặt vé');
      }

      const showtimeSeats = await manager.createQueryBuilder(ShowtimeSeat, 'ss')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('ss.seat', 's')
        .where('ss.id IN (:...ids)', { ids: dto.showtime_seat_ids })
        .andWhere('ss.showtime_id = :showtimeId', { showtimeId: dto.showtime_id })
        .getMany();

      if (showtimeSeats.length !== dto.showtime_seat_ids.length) {
        throw new BadRequestException('Một số ghế không tồn tại hoặc không thuộc suất chiếu này');
      }

      // 2. Kiểm tra ghế đang LOCKED bởi user (còn hạn)
      const now = new Date();
      let totalPrice = 0;

      for (const ss of showtimeSeats) {
        const lockedByUser =
          ss.status === ShowtimeSeatStatus.LOCKED &&
          ss.locked_by_user_id === userId &&
          ss.lock_expires_at &&
          ss.lock_expires_at > now;

        if (!lockedByUser) {
          throw new BadRequestException(
            `Ghế hàng ${ss.seat.seat_row} số ${ss.seat.seat_number} chưa được giữ bởi bạn hoặc đã hết hạn giữ ghế`,
          );
        }

        totalPrice += ss.price;
      }

      // 3. totalPrice đã tính ở vòng lặp trên — không cập nhật ShowtimeSeat (không chuyển SOLD)

      const bookingCode = `CNM${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Tạo booking PENDING
      const booking = manager.create(Booking, {
        booking_code: bookingCode,
        user_id: userId,
        showtime_id: showtime.id,
        room_id: showtime.room_id,
        cinema_id: showtime.room.cinema_id,
        customer_name: dto.customer_name,
        customer_email: dto.customer_email,
        customer_phone: dto.customer_phone,
        total_price: totalPrice,
        status: BookingStatus.PENDING,
        notes: dto.notes,
      });

      const savedBooking = await manager.save(Booking, booking);

      // 5. Tạo booking seats
      const bookingSeats = showtimeSeats.map((ss) =>
        manager.create(BookingSeat, {
          booking_id: savedBooking.id,
          showtime_seat_id: ss.id,
          seat_id: ss.seat_id,
          unit_price: ss.price.toString(),
        }),
      );

      await manager.save(BookingSeat, bookingSeats);

      // 6. Trả về booking kèm ghế đã lưu
      return manager.findOneOrFail(Booking, {
        where: { id: savedBooking.id },
        relations: { booking_seats: true },
      });
    });
  }

  /** Map entity (đã load relations) → DTO chi tiết. */
  private toBookingDetailDto(booking: Booking): BookingResponseDto {
    const st = booking.showtime;
    const movie = st?.movie;
    if (!st || !movie) {
      throw new NotFoundException('Không tìm thấy thông tin suất chiếu');
    }

    const seats = (booking.booking_seats ?? [])
      .filter((bs) => bs.seat)
      .sort((a, b) => {
        const rowCmp = a.seat!.seat_row.localeCompare(b.seat!.seat_row, undefined, { numeric: true });
        if (rowCmp !== 0) return rowCmp;
        return a.seat!.seat_number - b.seat!.seat_number;
      })
      .map((bs) => ({
        seat_id: bs.seat_id,
        seat_row: bs.seat!.seat_row,
        seat_number: bs.seat!.seat_number,
        unit_price: parseFloat(bs.unit_price),
      }));

    return {
      id: booking.id,
      booking_code: booking.booking_code,
      created_at: booking.created_at.toISOString(),
      status: booking.status,
      movie: {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        duration_minutes: movie.duration_minutes,
        poster_url: movie.poster_url,
      },
      showtime: {
        id: st.id,
        show_date: st.show_date,
        start_time: st.start_time instanceof Date ? st.start_time.toISOString() : String(st.start_time),
        end_time: st.end_time instanceof Date ? st.end_time.toISOString() : String(st.end_time),
        format: st.format,
        base_price: st.base_price,
        status: st.status,
        schedule_type: st.schedule_type,
        cinema_id: st.cinema_id,
        cinema_name: st.cinema?.name ?? '',
        room_id: st.room_id,
        room_name: st.room?.name ?? '',
      },
      seats,
      total_price: booking.total_price,
      payment_status: booking.payment?.status ?? null,
    };
  }

  /** Chi tiết đặt vé: movie, showtime, seats, total_price, payment_status (chỉ chủ booking). */
  async findOneForUser(userId: string | null, id: string): Promise<BookingResponseDto> {
    if (!userId) {
      throw new BadRequestException('Yêu cầu đăng nhập');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: {
        showtime: { movie: true, cinema: true, room: true },
        booking_seats: { seat: true },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt vé');
    }
    if (booking.user_id !== userId) {
      throw new ForbiddenException('Không có quyền xem đặt vé này');
    }

    return this.toBookingDetailDto(booking);
  }

  /** Tra cứu đặt vé theo mã vé (booking_code), không cần đăng nhập. */
  async findByBookingCode(rawCode: string): Promise<BookingResponseDto> {
    const bookingCode = rawCode?.trim() ?? '';
    if (bookingCode.length < 1 || bookingCode.length > 30) {
      throw new BadRequestException('Mã vé không hợp lệ');
    }
    if (!/^[\w-]+$/.test(bookingCode)) {
      throw new BadRequestException('Mã vé không hợp lệ');
    }

    const booking = await this.bookingRepository.findOne({
      where: { booking_code: bookingCode },
      relations: {
        showtime: { movie: true, cinema: true, room: true },
        booking_seats: { seat: true },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt vé');
    }

    return this.toBookingDetailDto(booking);
  }

  /**
   * Xác nhận booking sau thanh toán thành công (internal / admin / staff).
   * Yêu cầu: booking PENDING và payment SUCCESS. Idempotent nếu booking đã PAID.
   */
  async confirmAfterPayment(bookingId: string): Promise<BookingResponseDto> {
    await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: {
          booking_seats: { showtime_seat: true, seat: true },
          payment: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!booking) {
        throw new NotFoundException('Không tìm thấy đặt vé');
      }

      if (booking.status === BookingStatus.PAID) {
        return;
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Chỉ có thể xác nhận booking đang chờ thanh toán');
      }

      if (!booking.payment || booking.payment.status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException('Cần thanh toán thành công (payment SUCCESS) trước khi confirm');
      }

      booking.status = BookingStatus.PAID;

      const seatsToSell = (booking.booking_seats ?? [])
        .map((bs) => bs.showtime_seat)
        .filter((ss): ss is ShowtimeSeat => !!ss && ss.status === ShowtimeSeatStatus.LOCKED);

      for (const ss of seatsToSell) {
        ss.status = ShowtimeSeatStatus.SOLD;
        ss.locked_by_user_id = null;
        ss.lock_expires_at = null;
      }

      if (seatsToSell.length) {
        await manager.save(seatsToSell);
      }

      if (!booking.payment.paid_at) {
        booking.payment.paid_at = new Date();
        await manager.save(booking.payment);
      }

      await manager.save(booking);
    });

    const reloaded = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: {
        showtime: { movie: true, cinema: true, room: true },
        booking_seats: { seat: true },
        payment: true,
      },
    });

    if (!reloaded) {
      throw new NotFoundException('Không tìm thấy đặt vé');
    }

    try {
      await this.ticketService.ensureTicketsForPaidBooking(bookingId);
    } catch {
      /* ticket/QR có thể bổ sung sau; không làm fail confirm */
    }

    return this.toBookingDetailDto(reloaded);
  }

  /**
   * Hủy đặt vé (user hủy / bỏ thanh toán): PENDING → CANCELLED; ghế LOCKED|RESERVED → AVAILABLE;
   * payment PENDING → CANCELLED; hủy link payOS nếu có.
   */
  async cancelForUser(userId: string | null, id: string) {
    if (!userId) {
      throw new BadRequestException('Yêu cầu đăng nhập');
    }

    let payosPaymentLinkId: string | null = null;

    const result = await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: { booking_seats: true, payment: true },
      });

      if (!booking) {
        throw new NotFoundException('Không tìm thấy đặt vé');
      }
      if (booking.user_id !== userId) {
        throw new ForbiddenException('Không có quyền hủy đặt vé này');
      }
      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Chỉ có thể hủy đặt vé đang chờ thanh toán');
      }

      if (
        booking.payment?.provider === PaymentProvider.PAYOS &&
        booking.payment.status === PaymentStatus.PENDING &&
        booking.payment.transaction_id
      ) {
        payosPaymentLinkId = booking.payment.transaction_id;
      }

      if (booking.payment?.status === PaymentStatus.PENDING) {
        booking.payment.status = PaymentStatus.CANCELLED;
        await manager.save(booking.payment);
      }

      const seatIds = (booking.booking_seats ?? []).map((bs) => bs.showtime_seat_id);
      if (seatIds.length > 0) {
        const showtimeSeats = await manager
          .createQueryBuilder(ShowtimeSeat, 'ss')
          .setLock('pessimistic_write')
          .where('ss.id IN (:...ids)', { ids: seatIds })
          .getMany();

        if (showtimeSeats.length !== seatIds.length) {
          throw new BadRequestException('Dữ liệu ghế đặt vé không khớp');
        }

        for (const ss of showtimeSeats) {
          if (ss.status === ShowtimeSeatStatus.LOCKED) {
            if (ss.locked_by_user_id !== userId) {
              throw new BadRequestException('Ghế đang được giữ bởi tài khoản khác, không thể hủy an toàn');
            }
            ss.status = ShowtimeSeatStatus.AVAILABLE;
            ss.locked_by_user_id = null;
            ss.lock_expires_at = null;
          } else if (ss.status === ShowtimeSeatStatus.RESERVED) {
            ss.status = ShowtimeSeatStatus.AVAILABLE;
            ss.locked_by_user_id = null;
            ss.lock_expires_at = null;
          }
        }

        await manager.save(showtimeSeats);
      }

      booking.status = BookingStatus.CANCELLED;
      await manager.save(booking);

      return manager.findOneOrFail(Booking, {
        where: { id: booking.id },
        relations: { booking_seats: true, payment: true },
      });
    });

    if (payosPaymentLinkId) {
      try {
        await this.paymentService.cancelPayOsPaymentLink(payosPaymentLinkId, 'Người dùng hủy / bỏ thanh toán');
      } catch {
        /* link có thể đã hết hạn */
      }
    }

    await this.ticketService.cancelTicketsForBooking(id);

    return result;
  }

  // Lấy danh sách đặt vé
  async getMyBookings(userId: string | null, page: number, limit: number): Promise<GetBookingResponseDto> {
    if (!userId) {
      throw new BadRequestException('Yêu cầu đăng nhập');
    }

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10;

    const bookings = await this.bookingRepository.find({
      where: { user_id: userId },
      relations: { showtime: { movie: true, cinema: true, room: true }, booking_seats: { seat: true }, payment: true },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
      order: { created_at: 'DESC' },
    })

    const total = await this.bookingRepository.count({ where: { user_id: userId } });

    return {
      success: true,
      message: 'Lấy danh sách đặt vé thành công',
      data: {
        bookings: bookings.map((booking) => this.toBookingDetailDto(booking))
      },
      total,
      page: safePage,
      limit: safeLimit,
    };
  }
}
