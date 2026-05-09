import { MembershipLevel } from "../enums/membership-level.enum";
import { UserRole } from "../enums/user-role.enum";

export class CustomerProfileResponseDto{
    success: boolean;
    data: {
        user: {
            id: string,
            email: string,
            full_name: string,
            phone: string | null,
            avatar_url: string | null,
            role: UserRole,
            status: string,
        },
        customer_profile: {
            membership_level: MembershipLevel,
            points: number | undefined,
            total_spent: string | undefined,
            birth_date: string | null | undefined,
            gender: string | null | undefined,
            benefits: string[],
        }
    }
}
    
