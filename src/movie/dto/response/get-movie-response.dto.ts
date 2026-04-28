import { MovieAgeRating, MovieStatus } from "src/movie/enums/movie.enum";

export class GetShowingMoviesResponseDto {
    success: boolean;
    data: {
        message: string;
        movies: {
            id: string; // id
            title: string; // tiêu đề phim
            duration_minutes: number; // thời lượng
            genre: string[]; // thể loại
            status: MovieStatus; // trạng thái
            age_rating: MovieAgeRating | null; // độ tuổi
            poster_url: string; // ảnh
            trailer_url: string | null; // video
            start_date: Date | null; // ngày chiếu
        }[];
    }
}