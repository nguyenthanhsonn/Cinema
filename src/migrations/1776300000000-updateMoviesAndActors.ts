import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMoviesAndActors1776300000000
  implements MigrationInterface
{
  name = 'UpdateMoviesAndActors1776300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // movies: drop old columns
    await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "banner_url"');
    await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "slug"');
    await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "critic_score"');
    await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "release_date"');

    // movies: add new columns
    await queryRunner.query('ALTER TABLE "movies" ADD "start_date" date');
    await queryRunner.query('ALTER TABLE "movies" ADD "end_date" date');

    // actors: rename image_url -> img_url
    await queryRunner.query(
      'ALTER TABLE "actors" RENAME COLUMN "image_url" TO "img_url"',
    );

    // movie_casts: drop role_name + display_order
    await queryRunner.query('ALTER TABLE "movie_casts" DROP COLUMN "role_name"');
    await queryRunner.query(
      'ALTER TABLE "movie_casts" DROP COLUMN "display_order"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // movie_casts: add role_name + display_order back
    await queryRunner.query(
      'ALTER TABLE "movie_casts" ADD "role_name" character varying(100)',
    );
    await queryRunner.query(
      'ALTER TABLE "movie_casts" ADD "display_order" integer NOT NULL DEFAULT 0',
    );

    // actors: rename img_url -> image_url
    await queryRunner.query(
      'ALTER TABLE "actors" RENAME COLUMN "img_url" TO "image_url"',
    );

    // movies: drop new columns
    await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "end_date"');
    await queryRunner.query('ALTER TABLE "movies" DROP COLUMN "start_date"');

    // movies: add old columns back
    await queryRunner.query(
      'ALTER TABLE "movies" ADD "critic_score" numeric(3,1)',
    );
    await queryRunner.query(
      'ALTER TABLE "movies" ADD "slug" character varying(200) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "movies" ADD "banner_url" character varying(255)',
    );
    await queryRunner.query('ALTER TABLE "movies" ADD "release_date" date');
  }
}
