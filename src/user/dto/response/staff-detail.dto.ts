import { UserStatus } from "src/user/enums/status.enum";
import { UserRole } from "src/user/enums/user-role.enum";

export class StaffDetailDto {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    role: UserRole;
    status: UserStatus;
    created_at: Date;
}

export class GetStaffDetailResponseDto {
    success: boolean;
    data: StaffDetailDto;
}
