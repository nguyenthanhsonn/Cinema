export class CreateMovieResponseDto {
    success: boolean;
    data: {
        message: string;
        movie:{
            id: string;
            title: string;
            description: string;
            duration_minutes: number;
            genre: string[];
            status: string;
            age_rating: string;
            poster_url: string;
            trailer_url: string;
            director: string;
            actor: string[];
            start_date: Date;
            end_date: Date;
        }
    } 
}