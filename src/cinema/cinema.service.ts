import { HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/request/create-room.dto';
import { UpdateRoomDto } from './dto/request/update-room.dto';
import { CinemaFeatureMap } from './entities/cinema-feature-map.entity';
import { CinemaFeature } from './entities/cinema-feature.entity';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { Seat } from './entities/seat.entity';
import { RoomItemDto } from './dto/response/room-item.dto';
import { RoomStatus } from './enums/cinema.enum';

@Injectable()
export class CinemaService {
  private readonly logger = new Logger(CinemaService.name);

  constructor(
    @InjectRepository(Cinema)
    private readonly cinemaRepository: Repository<Cinema>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>
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

  // xoá phòng
  async deleteRoom(id: string) : Promise<RoomItemDto>{
    try {
      const room = await this.findRoomById(id);
      if(!room){
        throw new NotFoundException('Không tìm thấy phòng');
      }
      await this.roomRepo.update(id, {status: RoomStatus.INACTIVE});
      return this.mapToRoomItemDto(room);
    } catch (error) {
      if(error instanceof HttpException){
        throw error;
      }
      throw new HttpException(`Xoá phòng thất bại: ${error.message}`, 500);
      
    }
  }
}
