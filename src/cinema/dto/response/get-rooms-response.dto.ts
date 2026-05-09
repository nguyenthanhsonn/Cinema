import { RoomItemDto } from './room-item.dto';

export class GetRoomsResponseDto {
  success: boolean;
  data: {
    message: string;
    rooms: RoomItemDto[];
  };
}