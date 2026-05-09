import { Gender } from "src/user/enums/gender.enum";
import { MembershipLevel } from "src/user/enums/membership-level.enum";
import { UserStatus } from "src/user/enums/status.enum";
import { UserRole } from "src/user/enums/user-role.enum";

export class UserDetailDto{
    id: string;
    email: string;
    full_name: string;
    phone: string;
    avatar_url: string;
    role: UserRole;
    status: UserStatus;
    auth_provider: 'local' | 'google';
    created_at: Date;

    // customer profile (chỉ có khi role = CUSTOMER)
    profile: {
        membership_level: MembershipLevel;
        points: number;
        total_spent: number;
        birth_date: string | null;
        gender: Gender | null;
    } | null
}