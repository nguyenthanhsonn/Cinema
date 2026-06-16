import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { BookingConfirmAccessGuard } from './guards/booking-confirm-access.guard';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Tạo đặt vé
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: Request & { user?: { id?: string; sub?: string } }) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.bookingService.create(userId, createBookingDto);
  }

  // Tra cứu theo mã vé (public)
  @Get('code/:bookingCode')
  findByCode(@Param('bookingCode') bookingCode: string) {
    return this.bookingService.findByBookingCode(bookingCode);
  }

  // Lấy danh sách đặt vé của tôi
  @Get('me')
  @UseGuards(AuthGuard)
  async getMyBookings(
    @Req() req: Request & { user?: { id?: string; sub?: string } },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.bookingService.getMyBookings(userId, Number(page), Number(limit));
  }

  // Lấy thông tin đặt vé
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user?: { id?: string; sub?: string } }) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.bookingService.findOneForUser(userId, id);
  }

  // Xác nhận booking sau thanh toán (internal secret hoặc admin/staff JWT)
  @Patch(':id/confirm')
  @UseGuards(BookingConfirmAccessGuard)
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingService.confirmAfterPayment(id);
  }

  // Hủy đặt vé
  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user?: { id?: string; sub?: string } }) {
    const userId = req.user?.id ?? req.user?.sub ?? null;
    return this.bookingService.cancelForUser(userId, id);
  }
}
