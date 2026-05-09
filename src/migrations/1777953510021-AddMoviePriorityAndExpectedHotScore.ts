import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoviePriorityAndExpectedHotScore1777953510021 implements MigrationInterface {
    name = 'AddMoviePriorityAndExpectedHotScore1777953510021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ADD "admin_priority" integer NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE "movies" ADD "expected_hot_score" numeric(5,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "expected_hot_score"`);
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "admin_priority"`);
    }
}
