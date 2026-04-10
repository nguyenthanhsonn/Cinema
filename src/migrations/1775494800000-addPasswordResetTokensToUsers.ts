import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetTokensToUsers1775494800000
  implements MigrationInterface
{
  name = 'AddPasswordResetTokensToUsers1775494800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "password_reset_tokens" text',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN "password_reset_tokens"',
    );
  }
}
