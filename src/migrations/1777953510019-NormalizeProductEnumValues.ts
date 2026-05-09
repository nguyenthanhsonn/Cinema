import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeProductEnumValues1777953510019 implements MigrationInterface {
    name = 'NormalizeProductEnumValues1777953510019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT`);

        await this.renameEnumValue(queryRunner, 'products_category_enum', 'combo', 'COMBO');
        await this.renameEnumValue(queryRunner, 'products_category_enum', 'food', 'FOOD');
        await this.renameEnumValue(queryRunner, 'products_category_enum', 'drink', 'DRINK');
        await this.renameEnumValue(queryRunner, 'products_category_enum', 'merchandise', 'MERCHANDISE');

        await this.renameEnumValue(queryRunner, 'products_status_enum', 'active', 'ACTIVE');
        await this.renameEnumValue(queryRunner, 'products_status_enum', 'inactive', 'INACTIVE');
        await this.renameEnumValue(queryRunner, 'products_status_enum', 'out_of_stock', 'OUT_OF_STOCK');

        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT`);

        await this.renameEnumValue(queryRunner, 'products_status_enum', 'ACTIVE', 'active');
        await this.renameEnumValue(queryRunner, 'products_status_enum', 'INACTIVE', 'inactive');
        await this.renameEnumValue(queryRunner, 'products_status_enum', 'OUT_OF_STOCK', 'out_of_stock');

        await this.renameEnumValue(queryRunner, 'products_category_enum', 'COMBO', 'combo');
        await this.renameEnumValue(queryRunner, 'products_category_enum', 'FOOD', 'food');
        await this.renameEnumValue(queryRunner, 'products_category_enum', 'DRINK', 'drink');
        await this.renameEnumValue(queryRunner, 'products_category_enum', 'MERCHANDISE', 'merchandise');

        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'active'`);
    }

    private async renameEnumValue(
        queryRunner: QueryRunner,
        enumName: string,
        from: string,
        to: string,
    ): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                      AND t.typname = '${enumName}'
                      AND e.enumlabel = '${from}'
                ) AND NOT EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                      AND t.typname = '${enumName}'
                      AND e.enumlabel = '${to}'
                ) THEN
                    ALTER TYPE "public"."${enumName}" RENAME VALUE '${from}' TO '${to}';
                END IF;
            END
            $$;
        `);
    }
}
