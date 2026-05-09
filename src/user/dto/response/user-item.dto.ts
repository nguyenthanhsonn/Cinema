import { UserStatus } from "src/user/enums/status.enum";
import { UserRole } from "src/user/enums/user-role.enum";

export class UserItemDto {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    role: UserRole;
    status: UserStatus;
    auth_provider: 'local' | 'google';
    created_at: Date;
}