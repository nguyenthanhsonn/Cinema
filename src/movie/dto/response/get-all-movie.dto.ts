import { MovieItemDto } from "./movie-item.dto";

export class GetAllMovieResponseDto {
    success: boolean;
    data: {
        message: string;
        movies: MovieItemDto[];
    }
}