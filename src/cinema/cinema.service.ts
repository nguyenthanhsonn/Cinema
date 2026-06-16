import { ConflictException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { CreateRoomDto } from './dto/request/create-room.dto';
import { UpdateRoomDto } from './dto/request/update-room.dto';
import { CinemaFeatureMap } from './entities/cinema-feature-map.entity';
import { CinemaFeature } from './entities/cinema-feature.entity';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { Seat } from './entities/seat.entity';
import { RoomItemDto } from './dto/response/room-item.dto';
import { RoomStatus, SeatType } from './enums/cinema.enum';
import { GetRoomsResponseDto } from './dto/response/get-rooms-response.dto';
import { SeatItemDto } from './dto/response/seat-item.dto';
import { GenerateSeatsDto } from './dto/request/generate-seats.dto';
import { UpdateSeatDto } from './dto/request/update-seat.dto';
import { GenerateSeatsResponseDto } from './dto/response/generate-seats-response.dto';
import { BadRequestException } from '@nestjs/common';
import { RoomResponseDto } from './dto/response/room-response.dto';
import { RoomDetailDto } from './dto/response/room-detail.dto';
import { Showtime } from 'src/showtime/entities/showtime.entity';
import { ShowtimeStatus } from 'src/showtime/enums/showtime.enum';
import { Booking } from 'src/booking/entities/booking.entity';

@Injectable()
export class CinemaService {
  private readonly logger = new Logger(CinemaService.name);
  private readonly COUPLE_SEAT_PRICE_ADJUSTMENT = 95000;

  constructor(
    @InjectRepository(Cinema)
    private readonly cinemaRepository: Repository<Cinema>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Showtime)
    private readonly showtimeRepo: Repository<Showtime>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) { }

  private findRoomById(id: string) : Promise<Room | null>{
    return this.roomRepo.findOne({where: {id}});
  }

  private mapToRoomItemDto(room: Room): RoomItemDto {
    return{
      id: room.id,
      name: room.name,
      format: room.format,
      total_rows: room.total_rows,
      total_columns: room.total_columns,
      total_seats: room.total_seats,
      status: room.status,
      created_at: room.created_at,
    }
  }

  private mapToRoomDetailDto(room: Room): RoomDetailDto {
    return {
      ...this.mapToRoomItemDto(room),
      seats: (room.seats ?? []).map((seat) => this.mapToSeatItem(seat)),
    };
  }

  /** Chuyển đổi từ Entity Seat sang DTO SeatItemDto */
  private mapToSeatItem(seat: Seat): SeatItemDto {
    return {
      id: seat.id,
      room_id: seat.room_id,
      seat_row: seat.seat_row,
      seat_number: seat.seat_number,
      type: seat.type,
      price_adjustment: Number(seat.price_adjustment),
      is_active: seat.is_active,
    };
  }
    
  // tạo room
  async createRoom(dto: CreateRoomDto) : Promise<RoomItemDto>{
    try{
      const [cinema] = await this.cinemaRepository.find({
        order: { created_at: 'ASC' },
        take: 1,
      });
      if (!cinema) {
        throw new NotFoundException('Chưa có cinema mặc định để tạo phòng');
      }

      const room = this.roomRepo.create({
        ...dto,
        cinema_id: cinema.id,
        total_seats: dto.total_rows * dto.total_columns,
      });
      const savedRoom = await this.roomRepo.save(room);
      return this.mapToRoomItemDto(savedRoom);
    }catch(error){
      this.logger.error('Tạo phòng thất bại', error instanceof Error ? error.stack : undefined);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Tạo phòng thất bại: ${error.message}`, 500);
    }
  }

  // cập nhật phòng
  async updateRoom(id: string, dto: UpdateRoomDto) : Promise<RoomItemDto>{
    try{
      const room = await this.findRoomById(id);
      if(!room){
        throw new NotFoundException('Không tìm thấy phòng');
      }
      this.roomRepo.merge(room, dto);
      const savedRoom = await this.roomRepo.save(room);
      return this.mapToRoomItemDto(savedRoom);
    }catch(error){
      if(error instanceof HttpException){
        throw error;
      }
      throw new HttpException(`Cập nhật phòng thất bại: ${error.message}`, 500);
    }
  }

  async updateRoomStatus(id: string, status: RoomStatus): Promise<RoomItemDto> {
    try {
      const room = await this.findRoomById(id);
      if (!room) {
        throw new NotFoundException('Không tìm thấy phòng');
      }

      room.status = status;
      const savedRoom = await this.roomRepo.save(room);
      return this.mapToRoomItemDto(savedRoom);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Cập nhật trạng thái phòng thất bại: ${error.message}`, 500);
    }
  }

  // xoá phòng
  async deleteRoom(id: string) : Promise<RoomItemDto>{
    try {
      const room = await this.findRoomById(id);
      if(!room){
        throw new NotFoundException('Không tìm thấy phòng');
      }
      const [showtimeCount, bookingCount] = await Promise.all([
        this.showtimeRepo.count({ where: { room_id: id } }),
        this.bookingRepository.count({ where: { room_id: id } }),
      ]);

      if (showtimeCount > 0 || bookingCount > 0) {
        throw new BadRequestException(
          'Phòng đã có lịch chiếu hoặc booking, không thể xóa. Hãy đổi trạng thái phòng sang inactive.',
        );
      }

      await this.roomRepo.remove(room);
      return this.mapToRoomItemDto(room);
    } catch (error) {
      if(error instanceof HttpException){
        throw error;
      }
      throw new HttpException(`Xoá phòng thất bại: ${error.message}`, 500);
    }
  }

  // lấy tất cả các room đang active
  async getAllActiveRooms() : Promise<GetRoomsResponseDto>{
    const rooms = await this.roomRepo.find({
      where: { status: RoomStatus.ACTIVE },
    });
    return {
      success: true,
      data: {
        message: 'Lấy tất cả các phòng đang active thành công',
        rooms: rooms.map((room) => this.mapToRoomItemDto(room)),
      },
    };
  }

  // lấy tất cả room đang maintenance
  async getAllMaintenanceRooms() : Promise<GetRoomsResponseDto>{
    const rooms = await this.roomRepo.find({
      where: { status: RoomStatus.MAINTENANCE },
    });
    return {
      success: true,
      data: {
        message: 'Lấy tất cả các phòng đang bảo trì thành công',
        rooms: rooms.map((room) => this.mapToRoomItemDto(room)),
      },
    };
  }

  // lấy tất cả các room đang inactive
  async getAllInactiveRooms() : Promise<GetRoomsResponseDto>{
    const rooms = await this.roomRepo.find({
      where: { status: RoomStatus.INACTIVE },
    });
    return {
      success: true,
      data: {
        message: 'Lấy tất cả các phòng đang inactive thành công',
        rooms: rooms.map((room) => this.mapToRoomItemDto(room)),
      },
    };
  }

  // lấy tất cả các room
  async getAllRooms() : Promise<GetRoomsResponseDto>{
    const rooms = await this.roomRepo.find();
    return {
      success: true,
      data: {
        message: 'Lấy tất cả các phòng thành công',
        rooms: rooms.map((room) => this.mapToRoomItemDto(room)),
      },
    };
  }

  // lấy chi tiết một room
  async getRoom(id: string): Promise<RoomResponseDto> {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: { seats: true },
      order: {
        seats: {
          seat_row: 'ASC',
          seat_number: 'ASC',
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng');
    }

    return {
      success: true,
      data: {
        message: 'Lấy thông tin phòng thành công',
        room: this.mapToRoomDetailDto(room),
      },
    };
  }

  /** Lấy danh sách toàn bộ ghế của một phòng, sắp xếp theo tên hàng và số ghế */
  async getRoomSeats(roomId: string): Promise<SeatItemDto[]> {
    const seats = await this.seatRepository.find({
      where: { room_id: roomId },
      order: {
        seat_row: 'ASC',
        seat_number: 'ASC',
      },
    });

    return seats.map((seat) => this.mapToSeatItem(seat));
  }

  /** Cập nhật thông tin một ghế (Loại ghế, chênh lệch giá, trạng thái active) */
  async updateSeat(id: string, dto: UpdateSeatDto): Promise<SeatItemDto> {
    const seat = await this.seatRepository.findOne({ where: { id } });
    if (!seat) {
      throw new NotFoundException('Không tìm thấy ghế');
    }

    // Nếu thay đổi loại ghế nhưng không gửi price_adjustment, gán giá mặc định theo loại
    if (dto.type && dto.price_adjustment === undefined) {
      seat.price_adjustment = this.getSeatPriceAdjustment(dto.type).toString();
    }

    this.seatRepository.merge(seat, {
      ...dto,
      price_adjustment: dto.price_adjustment !== undefined ? dto.price_adjustment.toString() : seat.price_adjustment
    } as any);

    const savedSeat = await this.seatRepository.save(seat);
    return this.mapToSeatItem(savedSeat);
  }

  /** Vô hiệu hóa một ghế (Disable) */
  async disableSeat(id: string): Promise<SeatItemDto> {
    const seat = await this.seatRepository.findOne({ where: { id } });
    if (!seat) {
      throw new NotFoundException('Không tìm thấy ghế');
    }
    seat.is_active = false;
    const saved = await this.seatRepository.save(seat);
    return this.mapToSeatItem(saved);
  }

  /** Bật/Tắt trạng thái hoạt động của ghế */
  async toggleSeatStatus(id: string): Promise<SeatItemDto> {
    const seat = await this.seatRepository.findOne({ where: { id } });
    if (!seat) {
      throw new NotFoundException('Không tìm thấy ghế');
    }
    seat.is_active = !seat.is_active;
    const saved = await this.seatRepository.save(seat);
    return this.mapToSeatItem(saved);
  }

  /** Tự động sinh danh sách ghế cho phòng dựa trên số hàng và số ghế mỗi hàng */
  async generateSeats(dto: GenerateSeatsDto): Promise<GenerateSeatsResponseDto> {
    const room = await this.roomRepo.findOne({
      where: { id: dto.room_id },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chiếu');
    }

    // Kiểm tra xem phòng đã có ghế chưa để tránh tạo đè
    const existedSeats = await this.seatRepository.count({
      where: { room_id: dto.room_id },
    });

    if (existedSeats > 0) {
      throw new BadRequestException('Phòng này đã có ghế');
    }

    const seats: Seat[] = [];

    // Duyệt qua từng hàng
    for (let rowIndex = 0; rowIndex < dto.rows; rowIndex++) {
      const seatRow = String.fromCharCode(65 + rowIndex); // A, B, C...

      // Duyệt qua từng ghế trong hàng
      for (let seatNumber = 1; seatNumber <= dto.seats_per_row; seatNumber++) {
        const seatType = this.getSeatType(rowIndex, dto.rows);
        const priceAdjustment = this.getSeatPriceAdjustment(seatType);

        seats.push(
          this.seatRepository.create({
            room_id: dto.room_id,
            seat_row: seatRow,
            seat_number: seatNumber,
            type: seatType,
            price_adjustment: priceAdjustment.toString(),
          }),
        );
      }
    }

    // Lưu hàng loạt vào DB
    const createdSeats = await this.seatRepository.save(seats);

    return {
      success: true,
      data: {
        message: 'Tạo ghế cho phòng thành công',
        total_created: createdSeats.length,
        seats: createdSeats.map((seat) => this.mapToSeatItem(seat)),
      },
    };
  }

  /** Helper: Xác định loại ghế dựa trên vị trí hàng (Hàng cuối là Couple, 1/3 hàng sau là VIP, còn lại Standard) */
  private getSeatType(rowIndex: number, totalRows: number): SeatType {
    if (rowIndex >= totalRows - 1) {
      return SeatType.COUPLE;
    }

    if (rowIndex >= Math.floor(totalRows / 3)) {
      return SeatType.VIP;
    }

    return SeatType.STANDARD;
  }

  /** Helper: Lấy mức chênh lệch giá cho từng loại ghế */
  private getSeatPriceAdjustment(seatType: SeatType): number {
    switch (seatType) {
      case SeatType.COUPLE:
        return this.COUPLE_SEAT_PRICE_ADJUSTMENT;
      case SeatType.VIP:
      case SeatType.STANDARD:
      default:
        return 0;
    }
  }

  async removeRoom(id: string): Promise<{ success: boolean; data: { message: string } }> {
    const room = await this.roomRepo.findOne({where: {id: id}});

    if(!room){
      throw new NotFoundException("Không tìm thấy phòng chiếu");
    }

    // kiem tra con showtime chua dien ra
    const hasActiveShowtime = await this.showtimeRepo.existsBy({
      room_id: id,
      start_time: MoreThan(new Date()),
      status: ShowtimeStatus.ON_SALE,
    });

    if(hasActiveShowtime) throw new ConflictException(`Phòng này còn lịch chiếu, không thể xóa`);

    await this.roomRepo.update(id, { status: RoomStatus.INACTIVE });
    await this.seatRepository.update({ room_id: id }, { is_active: false });
    return {
      success: true,
      data: {
        message: 'Xóa phòng chiếu thành công',
      },
    };
  }
}
