import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CinemaService } from './cinema.service';
import { CreateRoomDto } from './dto/request/create-room.dto';
import { UpdateRoomDto } from './dto/request/update-room.dto';
import { UpdateRoomStatusDto } from './dto/request/update-room-status.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { GenerateSeatsDto } from './dto/request/generate-seats.dto';
import { UpdateSeatDto } from './dto/request/update-seat.dto';

@Controller('cinemas')
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) { }

  /** Tạo phòng chiếu mới */
  @Post('rooms')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.cinemaService.createRoom(dto);
  }

  /** Cập nhật thông tin phòng chiếu */
  @Patch('rooms/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.cinemaService.updateRoom(id, dto);
  }

  /** Cập nhật trạng thái phòng chiếu */
  @Patch('rooms/:id/status')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async updateRoomStatus(@Param('id') id: string, @Body() dto: UpdateRoomStatusDto) {
    return this.cinemaService.updateRoomStatus(id, dto.status);
  }

  /** Xóa mềm phòng chiếu */
  @Delete('rooms/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteRoom(@Param('id') id: string) {
    return this.cinemaService.deleteRoom(id);
  }

  /** Tự động sinh danh sách ghế cho phòng (Chỉ Admin) */
  @Post('seats/generate')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async generateSeats(@Body() dto: GenerateSeatsDto) {
    return this.cinemaService.generateSeats(dto);
  }


  /** Lấy sơ đồ ghế của một phòng chiếu */
  @Get('rooms/:id/seats')
  async getRoomSeats(@Param('id') roomId: string) {
    return this.cinemaService.getRoomSeats(roomId);
  }

  /** Lấy chi tiết một phòng chiếu */
  @Get('rooms/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getRoom(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cinemaService.getRoom(id);
  }

  // lấy tất cả các room đang active
  @Get('rooms-active')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllRoomsActive() {
    return this.cinemaService.getAllActiveRooms();
  }

  // lấy tất cả room đang maintenance
  @Get('rooms-maintenance')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllRoomsMaintenance() {
    return this.cinemaService.getAllMaintenanceRooms();
  }

  // lấy tất cả các room đang inactive
  @Get('rooms-inactive')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllRoomsInactive() {
    return this.cinemaService.getAllInactiveRooms();
  }

  // lấy tất cả các room
  @Get('rooms')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllRooms() {
    return this.cinemaService.getAllRooms();
  }

  /** Vô hiệu hóa một ghế (Chỉ Admin) */
  @Patch('seats/:id/disable')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async disableSeat(@Param('id') id: string) {
    return this.cinemaService.disableSeat(id);
  }

  /** Bật/Tắt trạng thái hoạt động của ghế (Chỉ Admin) */
  @Patch('seats/:id/toggle')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async toggleSeat(@Param('id') id: string) {
    return this.cinemaService.toggleSeatStatus(id);
  }

  /** Cập nhật thông tin ghế */
  @Patch('seats/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async updateSeat(@Param('id') id: string, @Body() dto: UpdateSeatDto) {
    return this.cinemaService.updateSeat(id, dto);
  }

  @Delete('rooms/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async removeRoom(@Param('id') id: string) {
    return this.cinemaService.removeRoom(id);
  }
}
