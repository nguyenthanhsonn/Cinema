import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Ensure public directions exist
  const publicPath = join(__dirname, '..', 'public');
  const avatarPath = join(publicPath, 'avatars');
  if (!existsSync(publicPath)) mkdirSync(publicPath);
  if (!existsSync(avatarPath)) mkdirSync(avatarPath);

  app.useStaticAssets(publicPath, {
    prefix: '/public/',
  });

  const apiPrefix = process.env.API_PREFIX ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://172.25.19.111:3000', 'http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 5050);
}
bootstrap();
