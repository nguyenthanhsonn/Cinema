import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const token = this.extractTokenFromHeader(request);

    console.log('Authorization:', request.headers.authorization);
    console.log('Cookie header:', request.headers.cookie);
    console.log('Extracted token:', token);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    // Guard này dùng chung cho cả 2 cách đăng nhập:
    // 1. login bằng email/password -> frontend thường gửi Authorization: Bearer <token>
    // 2. login bằng Google -> backend đang set access_token vào cookie sau callback
    // Vì vậy mình ưu tiên đọc từ header trước, nếu không có thì fallback sang cookie.
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    return this.extractTokenFromCookie(request, 'access_token');
  }

  private extractTokenFromCookie(request: Request, cookieName: string) {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }

    // Trường hợp chưa dùng cookie-parser, mình parse thẳng từ header "Cookie".
    // Format thường là: "access_token=...; refresh_token=..."
    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const targetCookie = cookies.find((cookie) =>
      cookie.startsWith(`${cookieName}=`),
    );

    if (!targetCookie) {
      return undefined;
    }

    return decodeURIComponent(targetCookie.split('=').slice(1).join('='));
  }
}
