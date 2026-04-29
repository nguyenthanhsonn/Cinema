export class ReviewUserDto {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export class ReviewMovieResponseDto {
  id: string;
  movie_id: string;
  user_id: string;
  user: ReviewUserDto;
  rating: number;
  comment: string | null;
  created_at: Date;
}

export class GetMovieReviewsResponseDto {
  success: boolean;
  data: {
    message: string;
    reviews: ReviewMovieResponseDto[];
    total: number;
  };
}
