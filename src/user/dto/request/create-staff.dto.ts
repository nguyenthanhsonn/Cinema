import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  phone?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;
}