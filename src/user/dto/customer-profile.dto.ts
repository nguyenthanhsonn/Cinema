export class CustomerProfileResponseDto{
    success: boolean;
    data: {
        user: {
            id: string,
            email: string,
            full_name: string,
            phone: string | null,
            avatar_url: string | null,
            role: 'customer' | 'admin' | 'staff',
            status: string,
        },
        customer_profile: {
            membership_level: string,
            points: number | undefined,
            total_spent: string | undefined,
            birth_date: string | null | undefined,
            gender: string | null | undefined,
        }
    }
}
    
