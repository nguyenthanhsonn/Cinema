import { MovieItemDto } from "./movie-item.dto";

export class GetComingSoonMoviesResponseDto {
    success: boolean;
    data: {
        message: string,
        movies: MovieItemDto[];
    }
}