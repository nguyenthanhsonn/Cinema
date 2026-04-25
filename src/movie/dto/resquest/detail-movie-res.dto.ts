export class DetailMovieResponseDto {
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    poster_url: string;
    trailer_url: string;
    director: string;
    age_rating: string;
    status: string;
    start_date: Date;
    end_date: Date;
    genre: string[];
    actor: string[];
  };
}
