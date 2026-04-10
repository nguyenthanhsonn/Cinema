import { Body, Controller, Get, Patch, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService){}

    @Get('me')
    async getMe(@Req() req){
        return this.userService.getMe(req.user.id);
    }
    
    @Put('update/me')
    @UseGuards(AuthGuard)
    async updateProfile(@Req() req, @Body() body: UpdateProfileDto){
        return this.userService.updateProfile(req.user.id, body);
    }
}
