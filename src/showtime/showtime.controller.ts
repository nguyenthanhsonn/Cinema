import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateShowtimeDto } from './dto/request/create-showtime.dto';
import { ShowtimeService } from './showtime.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { GetDraftShowtimesDto } from './dto/request/get-draft-showtime.dto';
import { UpdateShowtimeDto } from './dto/request/update-showtime.dto';
import { LockSeatsDto } from './dto/request/lock-seats.dto';
import { ReleaseSeatsDto } from './dto/request/release-seats.dto';
import { Request } from 'express';
import { GetShowtimeByWeekDto } from './dto/request/get-showtime-by-week.dto';

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

  // Sinh lịch chiếu nháp
  @Post('drafts/generate')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async generateShowtimeDraft() {
    return this.showtimeService.generateShowtimeSchedule();
  }

  // Lấy danh sách định dạng xuất chiếu nháp
  @Get('drafts')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getShowtimeDraft(@Query() query: GetDraftShowtimesDto) {
    return this.showtimeService.getShowtimeDraft(query);
  }

  /** Publish toàn bộ suất nháp trong hệ thống */
  @Post('drafts/publish')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async publishAllShowtimeDrafts() {
    return this.showtimeService.publishAllShowtimeDrafts();
  }

  //Pulic 1 suất chiếu nháp
  @Post('drafts/:id/publish')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async publishShowtimeDraft(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.showtimeService.publishShowtimeDraft(id);
  }

  // Sửa một suất chiếu nháp theo id
  @Patch('drafts/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async updateShowtimeDraft(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateShowtimeDto) {
    return this.showtimeService.updateShowtimeDraft(id, dto);
  }

  // Xóa một suất chiếu nháp theo id
  @Delete('drafts/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteShowtimeDraft(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.showtimeService.deleteShowtimeDraft(id);
  }

  /** Lấy danh sách ghế của một suất chiếu cụ thể kèm theo trạng thái và giá */
  // id ở đây là id của suất chiếu
  @Get(':id/seats')
  async getShowtimeSeats(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.showtimeService.getShowtimeSeats(id);
  }

  /** Khóa ghế tạm thời trong 5 phút để chờ thanh toán */
  @Post(':id/seats/lock')
  @UseGuards(AuthGuard)
  async lockSeats(@Param('id', new ParseUUIDPipe()) showtimeId: string, @Body() dto: LockSeatsDto, @Req() req: Request & { user?: { id?: string; sub?: string } }) {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.showtimeService.lockSeats(showtimeId, userId, dto);
  }

  /** Giải phóng ghế đã chọn trước khi hết hạn (Manual Release) */
  @Post(':id/seats/release')
  @UseGuards(AuthGuard)
  async releaseSeats(
    @Param('id', new ParseUUIDPipe()) showtimeId: string,
    @Body() dto: ReleaseSeatsDto,
    @Req() req: Request & { user?: { id?: string; sub?: string } },
  ) {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return this.showtimeService.releaseSeats(showtimeId, userId, dto);
  }

  // lấy lịch chiếu trong tuần cho user 
  @Get('week')
  async getShowtimeByWeek(@Query() query: GetShowtimeByWeekDto) {
    return this.showtimeService.getShowtimeByWeek(query);
  }

  // lấy lịch chiếu đã publish cho user
  @Get('published')
  async getPublishedShowtimes(@Query() query: GetShowtimeByWeekDto) {
    return this.showtimeService.getShowtimeByWeek(query);
  }
  
}
