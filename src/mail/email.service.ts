
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SendMailDto } from './dto/send-mail.dto';


@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(payload: SendMailDto): Promise<void> {
    const { to, subject, html, text } = payload;
    if (!html && !text) {
      throw new Error('sendMail requires html or text content');
    }

    await this.mailerService.sendMail({
      to,
      subject,
      html,
      text,
    });
  }

  // Email template đơn giản cho forgot-password
  async sendPasswordResetMail(to: string, resetLink: string): Promise<void> {
    const subject = 'Reset your password';
    const text = `We received a password reset request. If this was you, open: ${resetLink}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password reset</h2>
        <p>We received a password reset request.</p>
        <p>If this was you, click the link below:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `;

    return this.sendMail({ to, subject, html, text });
  }

  async sendRegisterOtpMail(to: string, otpCode: string): Promise<void> {
    const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3000';
    const resendOtpUrl = `${apiBaseUrl}/api/v1/auth/resend-otp`;
    const subject = 'Cinema account verification code';
    const text = `Mã xác thực của bạn là ${otpCode}. Mã này sẽ hết hạn trong 5 phút.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Xác thực tài khoản</h2>
        <p>Sử dụng mã bên dưới để kích hoạt tài khoản Cinema của bạn:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otpCode}</p>
        <p>Mã này sẽ hết hạn trong 5 phút.</p>
        <p>Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email này.</p>
        <p>Nếu OTP hết hạn, vui lòng yêu cầu mã mới tại: <a href="${resendOtpUrl}">${resendOtpUrl}</a></p>
      </div>
    `;

    return this.sendMail({ to, subject, html, text });
  }
}
