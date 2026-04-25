import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { Algorithm, SignOptions } from 'jsonwebtoken';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { CustomerProfile } from 'src/user/entities/customer-profile.entity';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

import googleOauthConfig from 'src/config/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailModule } from 'src/mail/email.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    MailModule,
    TypeOrmModule.forFeature([User, CustomerProfile]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const algorithm = configService.get<string>(
          'JWT_ALGORITHM',
        ) as Algorithm | undefined;
        const expiresIn = configService.get<string>(
          'JWT_EXPIRES_IN',
        ) as SignOptions['expiresIn'];

        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            algorithm,
            expiresIn,
          },
        };
      },
    }),
    ConfigModule.forFeature(googleOauthConfig),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RoleGuard, GoogleStrategy],

  exports: [AuthGuard, RoleGuard, JwtModule],

})
export class AuthModule {}
