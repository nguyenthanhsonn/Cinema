import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu ít nhất 6 ký tự' })
  password: string;

  @IsDateString()
  birth_date: string;

  @IsString()
  gender: string;
}
