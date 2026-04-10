import { UserStatus } from "src/user/enums/status.enum";

export class LoginResponseDto{
    success: boolean;
      data: {
        message: string;
        access_token: string;
        refresh_token: string;
        user: {
          id: string;
          email: string;
          full_name: string;
          role: 'customer' | 'admin' | 'staff';
          status: UserStatus;
        };
      };
}