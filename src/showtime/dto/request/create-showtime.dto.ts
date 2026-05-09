import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ScreeningFormat } from 'src/showtime/enums/showtime.enum';

export class CreateShowtimeDto {
  @IsUUID()
  @IsNotEmpty()
  movie_id: string;

  @IsUUID()
  @IsNotEmpty()
  room_id: string;

  @IsDateString()
  @IsNotEmpty()
  show_date: string; // "2026-05-01"

  @IsDateString()
  @IsNotEmpty()
  start_time: string; // "2026-05-01T10:00:00"

  @IsEnum(ScreeningFormat)
  @IsNotEmpty()
  format: ScreeningFormat;

  @IsNumber()
  @Min(0)
  base_price: number;
}
