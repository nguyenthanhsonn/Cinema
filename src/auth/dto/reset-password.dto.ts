import { IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto{
    @IsString()
    token: string;
    @IsString()
    @MinLength(6, {message: 'Độ dài mật khẩu tối đa phải 6 kí tự'})
    @MaxLength(15, {message: 'Độ dài mật khẩu tối đa phải 15 kí tự'})
    new_password: string;
}