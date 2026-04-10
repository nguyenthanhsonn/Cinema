import { UserStatus } from '../../user/enums/status.enum';

export class RegisterResponseDto {
  success: boolean;
  data: {
    message: string;
    user: {
      id: string;
      email: string;
      full_name: string;
      role: 'customer' | 'admin' | 'staff';
      status: UserStatus;
    };
  };
}
