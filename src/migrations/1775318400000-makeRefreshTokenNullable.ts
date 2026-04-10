import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeRefreshTokenNullable1775318400000
  implements MigrationInterface
{
  name = 'MakeRefreshTokenNullable1775318400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ALTER COLUMN "refresh_token" DROP NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ALTER COLUMN "refresh_token" SET NOT NULL',
    );
  }
}
