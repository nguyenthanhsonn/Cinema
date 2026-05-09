import { ScreeningFormat, ShowtimeStatus } from "src/showtime/enums/showtime.enum";

export class ShowtimeItemDto {
  id: string;
  movie_id: string;
  movie_title: string;
  cinema_id: string;
  cinema_name: string;
  room_id: string;
  room_name: string;
  show_date: string;
  start_time: Date;
  end_time: Date;
  format: ScreeningFormat;
  base_price: number;
  status: ShowtimeStatus;
  total_seats: number;
  available_seats: number;
}