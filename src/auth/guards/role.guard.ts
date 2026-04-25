import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';

type AuthenticatedRequest = {
  user?: {
    role?: UserRole;
  };
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('User does not have any roles or is not authenticated');
    }

    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      throw new ForbiddenException('User does not have the required permissions');
    }

    return true;
  }
}
