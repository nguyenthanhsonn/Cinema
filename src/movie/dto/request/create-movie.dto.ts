import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { MovieAgeRating, MovieStatus } from "src/movie/enums/movie.enum";

export class CreateMovieDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    duration_minutes: number;

    @IsArray()
    @IsString({each: true})
    @IsNotEmpty()
    genre: string[]

    @IsEnum(MovieStatus)
    @IsNotEmpty()
    status: MovieStatus

    @IsEnum(MovieAgeRating)
    @IsNotEmpty()
    age_rating: MovieAgeRating

    @IsString()
    @IsNotEmpty()
    poster_url: string

    @IsString()
    @IsNotEmpty()
    trailer_url: string

    @IsString()
    @IsNotEmpty()
    director: string

    @IsArray()
    @IsString({each: true})
    @IsNotEmpty()
    actor: string[]

    @IsDateString()
    @IsNotEmpty()
    start_date: Date;

    @IsDateString()
    @IsNotEmpty()
    end_date: Date
}
