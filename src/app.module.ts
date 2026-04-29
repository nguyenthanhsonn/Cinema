import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { CinemaModule } from './cinema/cinema.module';
import { databaseConfig } from './config/database.config';
import { MovieModule } from './movie/movie.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';
import { ShowtimeModule } from './showtime/showtime.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/email.module';
import * as Joi from 'joi'; // joi sử dụng để validate env
import googleOauthConfig from './config/google-oauth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.boolean().required(),
        DB_LOGGING: Joi.boolean().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().optional(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
        JWT_ALGORITHM: Joi.string().default('HS256'),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        EMAIL_HOST: Joi.string().required(),
        EMAIL_PORT: Joi.number().required(),
        EMAIL_USERNAME: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_FROM: Joi.string().required(),
        EMAIL_SECURE: Joi.boolean().default(false),
      }),
      load: [googleOauthConfig]
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    MailModule,
    UserModule,
    AuthModule,
    MovieModule,
    CinemaModule,
    ShowtimeModule,
    BookingModule,
    PaymentModule,
    NotificationModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
