import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ScreeningFormat } from 'src/showtime/enums/showtime.enum';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsEnum(ScreeningFormat)
  @IsOptional()
  format?: ScreeningFormat;
}