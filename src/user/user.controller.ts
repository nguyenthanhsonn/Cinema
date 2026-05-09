import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersQueryDto } from './dto/request/get-users-query.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserRole } from './enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateUserStatusDto } from './dto/request/update-user-status.dto';
import { CreateStaffDto } from './dto/request/create-staff.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post('staff')
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async createStaff(@Body() body: CreateStaffDto){
        return this.userService.createStaff(body);
    }
    
    // Lấy danh sách khách hàng
    @Get('customers')
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllCustomer(@Query() query: GetUsersQueryDto){
        return this.userService.getAllCustomer(query);
    }

    // Lấy danh sách nhân viên
    @Get('staffs')
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async getAllStaff(@Query() query: GetUsersQueryDto){
        return this.userService.getAllStaff(query);
    }

    @Get('me')
    async getMe(@Req() req){
        return this.userService.getMe(req.user.id);
    }
    
    @Put('update/me')
    @UseGuards(AuthGuard)
    async updateProfile(@Req() req, @Body() body: UpdateProfileDto){
        return this.userService.updateProfile(req.user.id, body);
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    async updateStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto){
        return this.userService.updateStatus(id, body);
    }
}
