import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserOtpAndPendingStatus1777953510022 implements MigrationInterface {
    name = 'AddUserOtpAndPendingStatus1777953510022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_status_enum" ADD VALUE IF NOT EXISTS 'PENDING' BEFORE 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "otp_code" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "otp_expires_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp_code"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TYPE "public"."users_status_enum" RENAME TO "users_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" TYPE "public"."users_status_enum" USING "status"::"text"::"public"."users_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum_old"`);
    }
}
