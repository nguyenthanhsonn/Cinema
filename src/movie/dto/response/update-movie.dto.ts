import { MovieItemDto } from "./movie-item.dto";

export class UpdateMovieResponseDto {
    success: boolean;
    data: {
        message: string;
        movie: MovieItemDto;
    }
}