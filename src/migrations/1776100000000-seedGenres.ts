import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGenres1776100000000 implements MigrationInterface {
  name = 'SeedGenres1776100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const genres = [
      'Hành động',
      'Phiêu lưu',
      'Hoạt hình',
      'Hài',
      'Tội phạm',
      'Tài liệu',
      'Chính kịch',
      'Gia đình',
      'Giả tưởng',
      'Lịch sử',
      'Kinh dị',
      'Âm nhạc',
      'Bí ẩn',
      'Lãng mạn',
      'Khoa học viễn tưởng',
      'Gay cấn',
      'Chiến tranh',
      'Viễn Tây',
    ];

    for (const name of genres) {
      await queryRunner.query(
        `INSERT INTO "genres" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING`,
        [name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const genres = [
      'Hành động',
      'Phiêu lưu',
      'Hoạt hình',
      'Hài',
      'Tội phạm',
      'Tài liệu',
      'Chính kịch',
      'Gia đình',
      'Giả tưởng',
      'Lịch sử',
      'Kinh dị',
      'Âm nhạc',
      'Bí ẩn',
      'Lãng mạn',
      'Khoa học viễn tưởng',
      'Gay cấn',
      'Chiến tranh',
      'Viễn Tây',
    ];

    for (const name of genres) {
      await queryRunner.query(`DELETE FROM "genres" WHERE "name" = $1`, [name]);
    }
  }
}
