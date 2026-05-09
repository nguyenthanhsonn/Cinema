import { UserItemDto } from "./user-item.dto";

export class GetUserResponseDto {
    success: boolean;
    data:{
        message: string;
        users: UserItemDto[];
        total: number;
        page: number;
        limit: number;
    };
}