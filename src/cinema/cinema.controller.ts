import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CinemaService } from './cinema.service';
import { CreateRoomDto } from './dto/request/create-room.dto';
import { UpdateRoomDto } from './dto/request/update-room.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';

@Controller('cinemas')
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) { }

  @Post('rooms')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.cinemaService.createRoom(dto);
  }
}
