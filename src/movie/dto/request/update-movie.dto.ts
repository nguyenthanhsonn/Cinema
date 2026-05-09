import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MovieAgeRating, MovieStatus } from 'src/movie/enums/movie.enum';

// kế thừa từ create-movie.dto
export class UpdateMovieDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    title?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    duration_minutes?: number;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    @IsOptional()
    genre?: string[]

    @IsEnum(MovieStatus)
    @IsNotEmpty()
    @IsOptional()
    status?: MovieStatus

    @IsEnum(MovieAgeRating)
    @IsNotEmpty()
    @IsOptional()
    age_rating?: MovieAgeRating

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    poster_url?: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    trailer_url?: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    director?: string

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    @IsOptional()
    actors?: string[]

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    start_date?: Date;

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    end_date?: Date
}
