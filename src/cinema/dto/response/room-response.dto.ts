import { RoomDetailDto } from './room-detail.dto';
import { RoomItemDto } from './room-item.dto';

export class RoomResponseDto {
  success: boolean;
  data: {
    message: string;
    room?: RoomItemDto | RoomDetailDto;
  };
}