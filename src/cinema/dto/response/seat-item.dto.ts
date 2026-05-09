import { SeatType } from 'src/cinema/enums/cinema.enum';

export class SeatItemDto {
  id: string;
  seat_row: string;
  seat_number: number;
  type: SeatType;
  base_price: string;
  price_adjustment: string;
}