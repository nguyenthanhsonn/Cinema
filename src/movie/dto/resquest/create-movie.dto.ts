import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

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

    @IsString()
    @IsNotEmpty()
    genre: string[]

    @IsString()
    @IsNotEmpty()
    status: string

    @IsString()
    @IsNotEmpty()
    age_rating: string

    @IsString()
    @IsNotEmpty()
    poster_url: string

    @IsString()
    @IsNotEmpty()
    trailer_url: string

    @IsString()
    @IsNotEmpty()
    director: string

    @IsString()
    @IsNotEmpty()
    actor: string[]

    @IsDate()
    @IsNotEmpty()
    start_date: Date;

    @IsDate()
    @IsNotEmpty()
    end_date: Date
    
    


}
