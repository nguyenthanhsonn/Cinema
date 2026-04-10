import { Body, Controller, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginDto } from './dto/login-auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { AuthGuard } from './guards/auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() body: CreateAuthDto): Promise<RegisterResponseDto> {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }

  @Post('refresh-token')
  async refreshToken(@Body() { refresh_token }): Promise<any> {
    return this.authService.refresh(refresh_token);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request & { user: { email: string } },
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.logout(req.user.email);

    // Xoa cookie de FE khong con token cu
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    res.status(200).json({
      success: true,
      data: { message: 'Logout successful' },
    });
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() { }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleLoginCallback(@Req() req, @Res() res: Response) {
    try {
      const loginRes = await this.authService.validateGoogleUser(req.user);
      console.log(loginRes);

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('access_token', loginRes.data.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie('refresh_token', loginRes.data.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });


      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?provider=google&status=success`,
      );
    } catch (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?provider=google&status=error`,
      );
    }
  }

  //forgot password controller
  @Post('forgot-password')
  async forgotPass(@Body() body: ForgotPasswordDto) {
    return this.authService.forgetPassword(body.email);
  }

  // reset password controller
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  // change password controller
  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePass(@Body() body: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(body, req.user.id);
  }
}
