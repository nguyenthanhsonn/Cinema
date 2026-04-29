export class CreateReviewResponseDto {
    success: boolean;
    data: {
        message: string;
        review: {
            id: string;
            movie_id: string;
            user_id: string;
            rating: number;
            comment: string | null;
        };
    }
}