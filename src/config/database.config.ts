import 'dotenv/config';
import 'reflect-metadata';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const toBoolean = (value?: string | boolean) =>
  value === true || value === 'true';

const buildDatabaseOptions = (config: {
  host?: string;
  port?: number | string;
  username?: string;
  password?: string;
  database?: string;
  synchronize?: boolean | string;
  logging?: boolean | string;
}): DataSourceOptions => ({
  type: 'postgres',
  host: config.host,
  port: Number(config.port ?? 5433),
  username: config.username,
  password: config.password,
  database: config.database,
  entities: [join(__dirname, '..', '**', '*.entity.{js,ts}')],
  migrations: [join(__dirname, '..', 'migrations', '*{.js,.ts}')],
  synchronize: toBoolean(config.synchronize),
  logging: toBoolean(config.logging),
});

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    ...buildDatabaseOptions({
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
      synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      logging: configService.get<boolean>('DB_LOGGING'),
    }),
    autoLoadEntities: true,
  }),
};

const appDataSource = new DataSource(
  buildDatabaseOptions({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNCHRONIZE,
    logging: process.env.DB_LOGGING,
  }),
);

export default appDataSource;
