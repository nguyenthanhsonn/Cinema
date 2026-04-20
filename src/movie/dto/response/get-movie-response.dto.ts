export class GetShowingMoviesResponseDto {
    success: boolean;
    data: {
        message: string;
        movies: {
            id: string; // id
            title: string; // tiêu đề phim
            duration_minutes: number; // thời lượng
            genre: string[]; // thể loại
            status: string; // trạng thái
            age_rating: string; // độ tuổi
            poster_url: string; // ảnh
            start_date: Date; // ngày chiếu
        }[];
    }
}