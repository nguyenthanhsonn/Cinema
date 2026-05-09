import { ShowtimeItemDto } from "./showtime-item.dto";

export class ShowtimeResponseDto {
  success: boolean;
  data: {
    message: string;
    showtime?: ShowtimeItemDto;
  };
}