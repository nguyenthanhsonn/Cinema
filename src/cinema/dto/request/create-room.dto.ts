import { IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';
import { ScreeningFormat } from 'src/showtime/enums/showtime.enum';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsEnum(ScreeningFormat)
  @IsNotEmpty()
  format: ScreeningFormat;

  @IsInt()
  @Min(1)
  @Max(26) // tối đa 26 hàng (A-Z)
  total_rows: number;

  @IsInt()
  @Min(1)
  @Max(50)
  total_columns: number;
}