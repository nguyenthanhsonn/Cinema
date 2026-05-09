import { IsDateString, IsEmail, IsEnum, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { Gender } from 'src/user/enums/gender.enum';

export class CreateAuthDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsPhoneNumber('VN')
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu ít nhất 6 ký tự' })
  password: string;

  @IsDateString()
  birth_date: string;

  @IsEnum(Gender)
  gender: Gender;
}
