import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQueryIndexes1775400000000 implements MigrationInterface {
  name = 'AddQueryIndexes1775400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_users_phone" ON "users" ("phone")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_staff_profiles_cinema_id" ON "staff_profiles" ("cinema_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_movies_title" ON "movies" ("title")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_movies_director" ON "movies" ("director")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_movies_status" ON "movies" ("status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_actors_name" ON "actors" ("name")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_reviews_user_id" ON "reviews" ("user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_reviews_movie_id" ON "reviews" ("movie_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_movie_genres_genre_id" ON "movie_genres" ("genre_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_movie_casts_actor_id" ON "movie_casts" ("actor_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cinemas_name" ON "cinemas" ("name")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cinemas_province" ON "cinemas" ("province")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cinemas_status" ON "cinemas" ("status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_cinema_feature_maps_feature_id" ON "cinema_feature_maps" ("feature_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_rooms_status" ON "rooms" ("status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtimes_movie_id" ON "showtimes" ("movie_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtimes_cinema_id" ON "showtimes" ("cinema_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtimes_room_id" ON "showtimes" ("room_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtimes_show_date" ON "showtimes" ("show_date")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtimes_status" ON "showtimes" ("status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtime_seats_seat_id" ON "showtime_seats" ("seat_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtime_seats_status" ON "showtime_seats" ("status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_showtime_seats_locked_by_user_id" ON "showtime_seats" ("locked_by_user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_user_id" ON "bookings" ("user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_showtime_id" ON "bookings" ("showtime_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_room_id" ON "bookings" ("room_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_cinema_id" ON "bookings" ("cinema_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_movie_id" ON "bookings" ("movie_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_customer_email" ON "bookings" ("customer_email")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_status" ON "bookings" ("status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_approved_by" ON "bookings" ("approved_by")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_rejected_by" ON "bookings" ("rejected_by")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_bookings_checked_in_by" ON "bookings" ("checked_in_by")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_booking_seats_showtime_seat_id" ON "booking_seats" ("showtime_seat_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_booking_seats_seat_id" ON "booking_seats" ("seat_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_booking_products_product_id" ON "booking_products" ("product_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_booking_status_logs_booking_id" ON "booking_status_logs" ("booking_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_booking_status_logs_acted_by_user_id" ON "booking_status_logs" ("acted_by_user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_payments_provider" ON "payments" ("provider")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_payments_status" ON "payments" ("status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_notifications_booking_id" ON "notifications" ("booking_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_products_name" ON "products" ("name")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_products_category" ON "products" ("category")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_products_status" ON "products" ("status")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_products_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_products_category"');
    await queryRunner.query('DROP INDEX "public"."IDX_products_name"');
    await queryRunner.query('DROP INDEX "public"."IDX_notifications_is_read"');
    await queryRunner.query('DROP INDEX "public"."IDX_notifications_booking_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_notifications_user_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_payments_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_payments_provider"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_booking_status_logs_acted_by_user_id"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_booking_status_logs_booking_id"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_booking_products_product_id"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_booking_seats_seat_id"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_booking_seats_showtime_seat_id"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_checked_in_by"');
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_rejected_by"');
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_approved_by"');
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_status"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_bookings_customer_email"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_movie_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_cinema_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_room_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_showtime_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_bookings_user_id"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_showtime_seats_locked_by_user_id"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_showtime_seats_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_showtime_seats_seat_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_showtimes_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_showtimes_show_date"');
    await queryRunner.query('DROP INDEX "public"."IDX_showtimes_room_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_showtimes_cinema_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_showtimes_movie_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_rooms_status"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_cinema_feature_maps_feature_id"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_cinemas_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_cinemas_province"');
    await queryRunner.query('DROP INDEX "public"."IDX_cinemas_name"');
    await queryRunner.query('DROP INDEX "public"."IDX_movie_casts_actor_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_movie_genres_genre_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_reviews_movie_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_reviews_user_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_actors_name"');
    await queryRunner.query('DROP INDEX "public"."IDX_movies_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_movies_director"');
    await queryRunner.query('DROP INDEX "public"."IDX_movies_title"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_staff_profiles_cinema_id"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_users_phone"');
  }
}
