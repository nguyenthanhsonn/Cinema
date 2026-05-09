import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateShowtimeDto } from './dto/request/create-showtime.dto';
import { ShowtimeService } from './showtime.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';

@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) { }

  // Tạo xuất chiếu
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async createShowtime(@Body() dto: CreateShowtimeDto) {
    return this.showtimeService.createShowtimne(dto);
  }
  

  // Lấy danh sách định dạng xuất chiếu
  @Get('formats')
  async getFormatShowtime() {
    return this.showtimeService.getFormatShowtime();
  }
}
