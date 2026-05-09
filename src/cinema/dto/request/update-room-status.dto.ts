import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoomStatus } from 'src/cinema/enums/cinema.enum';

export class UpdateRoomStatusDto {
  @IsEnum(RoomStatus)
  @IsNotEmpty()
  status: RoomStatus;
}