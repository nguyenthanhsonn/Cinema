import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeEnumValues1777953510018 implements MigrationInterface {
    name = 'NormalizeEnumValues1777953510018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" DROP DEFAULT`);

        await this.renameEnumValue(queryRunner, 'users_status_enum', 'active', 'ACTIVE');
        await this.renameEnumValue(queryRunner, 'users_status_enum', 'inactive', 'INACTIVE');
        await this.renameEnumValue(queryRunner, 'users_status_enum', 'suspended', 'SUSPENDED');

        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'active', 'NOW_SHOWING');
        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'inactive', 'COMING_SOON');
        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'suspended', 'ENDED');
        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'ĐANG CHIẾU', 'NOW_SHOWING');
        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'SẮP CHIẾU', 'COMING_SOON');
        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'NGỪNG CHIẾU', 'ENDED');

        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', 'p', 'P');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', 'k', 'K');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', '13 tuổi', 'T13');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', '16 tuổi', 'T16');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', '18 tuổi', 'T18');

        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" SET DEFAULT 'COMING_SOON'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`);

        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', 'P', 'p');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', 'K', 'k');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', 'T13', '13 tuổi');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', 'T16', '16 tuổi');
        await this.renameEnumValue(queryRunner, 'movies_age_rating_enum', 'T18', '18 tuổi');

        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'NOW_SHOWING', 'ĐANG CHIẾU');
        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'COMING_SOON', 'SẮP CHIẾU');
        await this.renameEnumValue(queryRunner, 'movies_status_enum', 'ENDED', 'NGỪNG CHIẾU');

        await this.renameEnumValue(queryRunner, 'users_status_enum', 'ACTIVE', 'active');
        await this.renameEnumValue(queryRunner, 'users_status_enum', 'INACTIVE', 'inactive');
        await this.renameEnumValue(queryRunner, 'users_status_enum', 'SUSPENDED', 'suspended');

        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "status" SET DEFAULT 'SẮP CHIẾU'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'active'`);
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
