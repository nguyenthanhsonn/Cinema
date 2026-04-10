import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntity1775273195740 implements MigrationInterface {
    name = 'UpdateUserEntity1775273195740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token"`);
    }

}
