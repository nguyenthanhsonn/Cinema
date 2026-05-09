import { MovieAgeRating, MovieStatus } from "src/movie/enums/movie.enum";

// movie-item.dto.ts
export class MovieItemDto {
  id: string;
  title: string;
  duration_minutes: number;
  genre: string[];
  status: MovieStatus;
  age_rating: MovieAgeRating | null;
  poster_url: string;
  trailer_url: string | null;
  actor: string[];
  start_date: Date | null;
}