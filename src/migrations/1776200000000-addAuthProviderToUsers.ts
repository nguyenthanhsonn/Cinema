import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthProviderToUsers1776200000000
  implements MigrationInterface
{
  name = 'AddAuthProviderToUsers1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "auth_provider" character varying(20) NOT NULL DEFAULT \'local\'',
    );
    await queryRunner.query(
      'ALTER TABLE "users" ADD "provider_id" character varying(255)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "provider_id"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "auth_provider"');
  }
}
