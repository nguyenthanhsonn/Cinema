import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
