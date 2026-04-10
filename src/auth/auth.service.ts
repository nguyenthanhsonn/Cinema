import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/user/enums/user-role.enum';
import { UserStatus } from 'src/user/enums/status.enum';
import { CustomerProfile } from 'src/user/entities/customer-profile.entity';
import { LoginDto } from './dto/login-auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { EmailService } from 'src/mail/email.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangePasswordResDto } from './dto/change-password-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


type GoogleProfilePayload = {
  email: string;
  full_name: string;
  avatar_url: string | null;
  provider_id?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService

  ) { }
  private readonly logger = new Logger(AuthService.name);
  private readonly passwordResetExpiresMs = 15 * 60 * 1000;

  private buildPasswordResetToken(): {
    token: string;
    hash: string;
    expiresAt: Date;
  } {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + this.passwordResetExpiresMs);

    return { token, hash, expiresAt };
  }

  // generate access_token va refresh_token
  private async generateToken(payload: { id: string, email: string, role: UserRole }) {
    const access_token = await this.jwtService.signAsync(payload);
    // secret dùng để sign refresh_token
    const refresh_token = await this.jwtService.signAsync(payload,
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') as JwtSignOptions['expiresIn']
      }
    );
    // Lưu refresh token vào database
    await this.userService.updateRefreshToken(payload.email, refresh_token);
    return { access_token, refresh_token };
  }

  // refresh_token
  async refresh(refresh_token: string): Promise<any> {
    try {
      // verify refresh_token
      const verify = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      this.logger.log(verify);
      // check refresh_token có tồn tại trong database không
      const checkExistRefresh = await this.userRepo.findOneBy({ email: verify.email, refreshToken: refresh_token });
      if (checkExistRefresh) {
        return this.generateToken({ id: verify.id, email: verify.email, role: verify.role });
      } else {
        throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
    }
  }

  // Map role sang string
  private mapRegisterRole(role: UserRole): 'customer' | 'admin' | 'staff' {
    if (role === UserRole.ADMIN) return 'admin';
    if (role === UserRole.STAFF) return 'staff';
    return 'customer';
  }

  // Đăng ký
  async register(register: CreateAuthDto): Promise<RegisterResponseDto> {
    const existEmail = await this.userService.findUserByEmail(register.email);
    if (existEmail) throw new BadRequestException('Email already exists');

    const existPhone = await this.userService.findUserByPhone(register.phone);
    if (existPhone) throw new BadRequestException('Phone already exists');

    const hashPassword = bcrypt.hashSync(register.password, 10);

    return this.dataSource.transaction(async (manager) => {
      // Bảng users chỉ giữ thông tin đăng nhập/chung của tài khoản.
      // Các field như birth_date, gender không thuộc users nên không save ở đây.
      const newUser = await manager.save(User, {
        email: register.email,
        full_name: register.full_name,
        phone: register.phone,
        password_hash: hashPassword,
        // Tai khoan dang ky bang email/password la local
        authProvider: 'local',
        providerId: null,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        refreshToken: null,
      });

      // Hồ sơ customer được tách sang customer_profiles theo đúng schema DB.
      // Vì vậy dữ liệu từ form đăng ký như birth_date, gender sẽ được lưu ở bảng này.
      await manager.save(CustomerProfile, {
        user_id: newUser.id,
        birth_date: register.birth_date,
        gender: register.gender,
      });

      return {
        success: true,
        data: {
          message: 'Register successful',
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: this.mapRegisterRole(newUser.role),
            status: newUser.status,
          },
        },
      };
    });
  }

  // Đăng nhập
  async login(login: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findUserByEmail(login.email);
    if (!user) throw new HttpException('Email không tồn tại', HttpStatus.UNAUTHORIZED);
    // Neu tai khoan la Google/OAuth thi KHONG cho login bang mat khau.
    if (user.authProvider !== 'local' || !user.password_hash) {
      throw new HttpException(
        'Tài khoản này đăng nhập bằng Google, vui lòng dùng Google Sign-In',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const checkPassword = await bcrypt.compare(login.password, user.password_hash);
    if (!checkPassword) throw new HttpException('Mật khẩu không đúng', HttpStatus.UNAUTHORIZED);

    // generate access_token va refresh_token
    const payload = { id: user.id, email: user.email, role: user.role }
    const { access_token, refresh_token } = await this.generateToken(payload);

    return {
      success: true,
      data: {
        message: 'Login successful',
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: this.mapRegisterRole(user.role),
          status: user.status,
        }
      },
    };
  }

  // logout
  async logout(email: string): Promise<LogoutResponseDto> {
    // Logout nên xóa hẳn refresh token khỏi DB thay vì để chuỗi rỗng.
    // Dùng null sẽ rõ nghĩa hơn: user hiện không còn refresh token hợp lệ.
    await this.userService.updateRefreshToken(email, null);

    return {
      success: true,
      data: {
        message: 'Logout successful',
      },
    };
  }

  // google login
  async validateGoogleUser(googleUser: GoogleProfilePayload): Promise<LoginResponseDto> {
    this.logger.log(`[GoogleAuth] Login attempt: ${googleUser.email}`);

    if (!googleUser.email) {
      this.logger.warn('[GoogleAuth] Missing email from Google');
      throw new BadRequestException('Google account does not provide email');
    }

    try {
      let user = await this.userService.findUserByEmail(googleUser.email);

      if (user) {
        this.logger.log(`[GoogleAuth] Existing user: ${user.email}`);
      }

      if (!user) {
        user = await this.dataSource.transaction(async (manager) => {
          const newUser = await manager.save(User, {
            email: googleUser.email,
            full_name: googleUser.full_name,
            phone: null,
            avatar_url: googleUser.avatar_url,
            authProvider: 'google',
            providerId: googleUser.provider_id ?? null,
            password_hash: '',
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
            refreshToken: null,
          });

          this.logger.log(`[GoogleAuth] New user created: ${newUser.email}`);

          await manager.save(CustomerProfile, {
            user_id: newUser.id,
            birth_date: null,
            gender: null,
          });

          this.logger.log(`[GoogleAuth] Profile created for userId=${newUser.id}`);

          return newUser;
        });
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      const { access_token, refresh_token } = await this.generateToken(payload);

      return {
        success: true,
        data: {
          message: 'Login successful',
          access_token,
          refresh_token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: this.mapRegisterRole(user.role),
            status: user.status,
          },
        },
      };

    } catch (error) {
      this.logger.error(`[GoogleAuth] Login failed for ${googleUser.email}`,error.stack);
      throw error;
    }
  }

  //forget password
  async forgetPassword(email: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    // Tránh lộ thông tin tài khoản: luôn trả về "đã gửi email" dù có user hay không.
    if (!user) {
      return {
        success: true,
        data: {
          message: 'Email đặt lại mật khẩu đã được gửi',
        },
      };
    }

    // generate reset token
    const { token, hash, expiresAt } = this.buildPasswordResetToken();
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    // Lưu token reset thành 2 cột riêng: hash + expiresAt
    // Dùng hash để nếu DB bị lộ thì token thật vẫn không bị lộ theo.
    user.passwordResetTokenHash = hash;
    user.passwordResetTokenExpiresAt = expiresAt;
    await this.userRepo.save(user);

    await this.emailService.sendPasswordResetMail(user.email, resetLink);
    return {
      success: true,
      data: {
        message: 'Email đặt lại mật khẩu đã được gửi',
      },
    };
  }

  // reset password
  async resetPassword(resetPassword: ResetPasswordDto): Promise<string> {
    try {
      const hashedToken = crypto.createHash('sha256').update(resetPassword.token).digest('hex');

      const user = await this.userRepo.findOne({
        where: { passwordResetTokenHash: hashedToken },
      });

      if (!user || !user.passwordResetTokenHash) {
        throw new HttpException('Token không hợp lệ hoặc đã hết hạn', HttpStatus.BAD_REQUEST);
      }

      if (
        !user.passwordResetTokenExpiresAt ||
        Date.now() > user.passwordResetTokenExpiresAt.getTime()
      ) {
        // Nếu token đã hết hạn thì dọn sạch khỏi DB.
        user.passwordResetTokenHash = null;
        user.passwordResetTokenExpiresAt = null;
        await this.userRepo.save(user);
        throw new HttpException('Token không hợp lệ hoặc đã hết hạn', HttpStatus.BAD_REQUEST);
      }

      // Cập nhật mật khẩu và dọn token trong cùng một lần save
      // để tránh ghi đè password_hash bởi entity cũ.
      user.password_hash = bcrypt.hashSync(resetPassword.new_password, 10);
      user.passwordResetTokenHash = null;
      user.passwordResetTokenExpiresAt = null;
      await this.userRepo.save(user);

      return 'Đặt lại mật khẩu thành công';
    } catch (error) {
      throw new HttpException('Đặt lại mật khẩu thất bại', HttpStatus.BAD_REQUEST);
    }
  }

  // change password
  async changePassword(changePassword: ChangePasswordDto, userId: string): Promise<ChangePasswordResDto> {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new HttpException('Tài khoản không tồn tại', HttpStatus.BAD_REQUEST);

    const checkPassword = await bcrypt.compare(changePassword.old_password, user.password_hash);
    if (!checkPassword) throw new HttpException('Mật khẩu cũ không đúng', HttpStatus.BAD_REQUEST);

    // updatePass() đã tự hash mật khẩu mới, nên chỉ cần truyền raw password
    // để tránh hash 2 lần (hash(hash(password))).
    await this.userService.updatePass(user.id, changePassword.new_password);

    return {
      success: true,
      message: 'Thay đổi mật khẩu thành công'
    };
  }
}
