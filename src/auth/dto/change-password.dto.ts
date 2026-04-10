import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto{
    @IsString()
    @IsNotEmpty()
    @MinLength(6, {message: 'Password must be at least 6 characters long'})
    old_password: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(6, {message: 'Password must be at least 6 characters long'})
    new_password: string;
}