import { IsDateString, IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Gender } from 'src/user/enums/gender.enum';

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

  @IsEnum(Gender)
  gender: Gender;
}
