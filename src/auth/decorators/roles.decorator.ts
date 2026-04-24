import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/enums/user-role.enum';

// Dùng chung một key để decorator và guard nói chuyện với nhau.
// Ví dụ:
// @UseGuards(AuthGuard, RoleGuard)
// @Roles(UserRole.ADMIN)
export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
