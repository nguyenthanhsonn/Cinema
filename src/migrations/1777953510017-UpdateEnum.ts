import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnum1777953510017 implements MigrationInterface {
    name = 'UpdateEnum1777953510017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cinema_features" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "cinema_features" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "movie_genres" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "movie_genres" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TYPE "public"."movies_status_enum" RENAME TO "movies_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."movies_status_enum" AS ENUM('ĐANG CHIẾU', 'SẮP CHIẾU', 'NGỪNG CHIẾU')`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" TYPE "public"."movies_status_enum" USING "status"::"text"::"public"."movies_status_enum"`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" SET DEFAULT 'SẮP CHIẾU'`);
        await queryRunner.query(`DROP TYPE "public"."movies_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."movies_status_enum_old" AS ENUM('ĐANG CHIẾU', 'SẮP CHIẾU')`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" TYPE "public"."movies_status_enum_old" USING "status"::"text"::"public"."movies_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" SET DEFAULT 'SẮP CHIẾU'`);
        await queryRunner.query(`DROP TYPE "public"."movies_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."movies_status_enum_old" RENAME TO "movies_status_enum"`);
        await queryRunner.query(`ALTER TABLE "movie_genres" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "movie_genres" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cinema_features" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cinema_features" ADD "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

}
