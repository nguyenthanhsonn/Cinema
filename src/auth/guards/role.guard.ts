import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Route không khai báo @Roles(...) thì RoleGuard không chặn.
    // Việc xác thực đăng nhập vẫn do AuthGuard chịu trách nhiệm.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { role?: UserRole } }>();

    // RoleGuard giả định AuthGuard đã chạy trước và gắn payload vào request.user.
    // Nếu chưa có user thì trả 401 thay vì 403 để phân biệt rõ chưa đăng nhập và sai quyền.
    if (!request.user || !request.user.role) {
      throw new UnauthorizedException('User role is missing');
    }

    const hasRequiredRole = requiredRoles.includes(request.user.role);
    if (!hasRequiredRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}