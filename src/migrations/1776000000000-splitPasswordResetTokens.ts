import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitPasswordResetTokens1776000000000
  implements MigrationInterface
{
  name = 'SplitPasswordResetTokens1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN "password_reset_tokens"',
    );
    await queryRunner.query(
      'ALTER TABLE "users" ADD "password_reset_token_hash" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "users" ADD "password_reset_token_expires_at" TIMESTAMP',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN "password_reset_token_expires_at"',
    );
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN "password_reset_token_hash"',
    );
    await queryRunner.query(
      'ALTER TABLE "users" ADD "password_reset_tokens" text',
    );
  }
}
