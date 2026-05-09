import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { UserStatus } from "src/user/enums/status.enum";

export class UpdateUserStatusDto {
    @IsEnum(UserStatus)
    status: UserStatus;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    reason?: string;
}