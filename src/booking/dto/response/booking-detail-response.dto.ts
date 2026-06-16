import { PaymentStatus } from 'src/payment/enums/payment.enum';
import { BookingStatus } from 'src/booking/enums/booking.enum';
import { ScreeningFormat, ScheduleType, ShowtimeStatus } from 'src/showtime/enums/showtime.enum';

export class BookingDetailMovieDto {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  poster_url: string | null;
}

export class BookingDetailShowtimeDto {
  id: string;
  show_date: string;
  start_time: string;
  end_time: string;
  format: ScreeningFormat;
  base_price: number;
  status: ShowtimeStatus;
  schedule_type: ScheduleType;
  cinema_id: string;
  cinema_name: string;
  room_id: string;
  room_name: string;
}

export class BookingDetailSeatDto {
  seat_id: string;
  seat_row: string;
  seat_number: number;
  unit_price: number;
}

export class BookingResponseDto {
  id: string;
  booking_code: string;
  created_at: string;
  status: BookingStatus;
  movie: BookingDetailMovieDto;
  showtime: BookingDetailShowtimeDto;
  seats: BookingDetailSeatDto[];
  total_price: number;
  payment_status: PaymentStatus | null;
}
