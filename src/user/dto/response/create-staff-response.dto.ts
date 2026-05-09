import { UserItemDto } from "./user-item.dto";

export class CreateStaffResponseDto {
  success: boolean;
  data: {
    message: string;
    staff: UserItemDto;
  };
}