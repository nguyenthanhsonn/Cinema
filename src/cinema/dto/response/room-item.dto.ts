import { ScreeningFormat } from 'src/showtime/enums/showtime.enum';
import { RoomStatus } from 'src/cinema/enums/cinema.enum';

export class RoomItemDto {
  id: string;
  name: string;
  format: ScreeningFormat;
  total_rows: number;
  total_columns: number;
  total_seats: number;
  status: RoomStatus;
  created_at: Date;
}