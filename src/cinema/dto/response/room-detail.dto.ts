import { RoomItemDto } from './room-item.dto';
import { SeatItemDto } from './seat-item.dto';

export class RoomDetailDto extends RoomItemDto {
  seats: SeatItemDto[];
}