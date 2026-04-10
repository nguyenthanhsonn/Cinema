
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
}
