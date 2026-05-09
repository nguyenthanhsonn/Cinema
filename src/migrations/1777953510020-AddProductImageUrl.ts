import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductImageUrl1777953510020 implements MigrationInterface {
    name = 'AddProductImageUrl1777953510020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "image_url" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image_url"`);
    }
}
