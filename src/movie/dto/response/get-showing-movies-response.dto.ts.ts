import { MovieAgeRating, MovieStatus } from "src/movie/enums/movie.enum";
import { MovieItemDto } from "./movie-item.dto";

export class GetShowingMoviesResponseDto {
    success: boolean;
    data: {
        message: string;
        movies: MovieItemDto[]
    }
}