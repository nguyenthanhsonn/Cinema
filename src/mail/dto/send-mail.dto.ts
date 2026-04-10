import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SendMailDto{
    @IsString()
    to: string;

    @IsString()
    subject: string;

    @IsString()
    html?: string;

    @IsString()
    text?: string
}