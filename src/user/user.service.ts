import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enums/user-role.enum';
import { CustomerProfileResponseDto } from './dto/customer-profile.dto';
import { CustomerProfile } from './entities/customer-profile.entity';
import { MembershipLevel } from './enums/membership-level.enum';
import { GetUsersQueryDto } from './dto/request/get-users-query.dto';
import { GetUserResponseDto } from './dto/response/get-user-response.dto';
import { UserStatus } from './enums/status.enum';
import { UpdateUserStatusDto } from './dto/request/update-user-status.dto';
import { CreateStaffDto } from './dto/request/create-staff.dto';
import { CreateStaffResponseDto } from './dto/response/create-staff-response.dto';
import { UserItemDto } from './dto/response/user-item.dto';
import { DeleteStaffResponseDto } from './dto/response/delete-staff.dto';
import { UpdateUserStatusResponseDto } from './dto/response/update-user-status.dto';
import { GetStaffDetailResponseDto } from './dto/response/staff-detail.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource
  ) { }
  // Map role sang string
  private mapRegisterRole(role: UserRole): UserRole {
    if (role === UserRole.ADMIN) return UserRole.ADMIN;
    if (role === UserRole.STAFF) return UserRole.STAFF;
    return UserRole.CUSTOMER;
  }

  private mapToUserItem(user: User): UserItemDto {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: this.mapRegisterRole(user.role),
      status: user.status,
      auth_provider: user.auth_provider,
      created_at: user.created_at,
    }
  }

  // Map quyền lợi theo từng hạng thành viên.
  // Khi business thay đổi ưu đãi, chỉ cần sửa danh sách ở đây.
  private getMembershipBenefits(level: MembershipLevel): string[] {
    const benefitsByLevel: Record<MembershipLevel, string[]> = {
      [MembershipLevel.STANDARD]: [
        'Tích điểm khi đặt vé và mua sản phẩm',
        'Nhận thông báo phim mới và ưu đãi chung',
      ],
      [MembershipLevel.SILVER]: [
        'Tất cả quyền lợi hạng Standard',
        'Ưu đãi sinh nhật cho thành viên',
        'Đổi điểm lấy voucher giảm giá',
      ],
      [MembershipLevel.GOLD]: [
        'Tất cả quyền lợi hạng Silver',
        'Ưu tiên nhận mã giảm giá vé xem phim',
        'Ưu đãi combo bắp nước theo chương trình',
      ],
      [MembershipLevel.PLATINUM]: [
        'Tất cả quyền lợi hạng Gold',
        'Ưu tiên đặt vé trong các chương trình đặc biệt',
        'Nhận ưu đãi thành viên cao nhất trong hệ thống',
      ],
    };

    return benefitsByLevel[level];
  }

  // Lấy danh sách user theo role
  private async getUserByRole(query: GetUsersQueryDto, roles: UserRole[], message: string): Promise<GetUserResponseDto> {
    const page = Math.max(Number(query.page), 1) || 1;
    const limit = Math.max(Number(query.limit), 1) || 10;
    const { search, status } = query;

    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.full_name', 'user.phone', 'user.avatar_url', 'user.role', 'user.status', 'user.auth_provider', 'user.created_at'])
      .where('user.role IN (:...roles)', { roles });

    if (search) {
      queryBuilder.andWhere('(user.email ILIKE :search OR user.full_name ILIKE :search)', { search: `%${search}%` });
    }
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    const [users, total] = await queryBuilder
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        message,
        users: users as any,
        total,
        page,
        limit,
      },
    };
  }


  // Tìm user theo email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } })
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } })
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { phone } });
  }


  // Cập nhật refresh token.
  // Dùng `string | null` để hỗ trợ cả 2 trường hợp:
  // - login/refresh: lưu token mới
  // - logout: xóa token khỏi DB bằng null
  async updateRefreshToken(email: string, refresh_token: string | null): Promise<User> {
    const user = await this.findUserByEmail(email)
    if (!user) throw new Error('User not found')
    user.refreshToken = refresh_token
    return this.userRepo.save(user)
  }

  // update password for user
  async updatePass(id: string, newPass: string): Promise<User> {
    const user = await this.findUserById(id)
    if (!user) throw new Error('User not found')
    user.password_hash = bcrypt.hashSync(newPass, 10)
    return this.userRepo.save(user)
  }
  // Lưu refresh token
  async saveRefreshToken(email: string, refresh_token: string): Promise<User> {
    const user = await this.findUserByEmail(email)
    if (!user) throw new Error('User not found')
    user.refreshToken = refresh_token
    return this.userRepo.save(user)
  }

  // customer profile
  async getMe(id: string): Promise<CustomerProfileResponseDto> {
    const user = await this.findUserById(id)
    if (!user) throw new NotFoundException('User not found')
    const customerProfile = await this.dataSource.getRepository(CustomerProfile).findOneBy({ user_id: id });
    // Nếu user chưa có customer_profile, mặc định xem là hạng Standard.
    const membershipLevel = customerProfile?.membership_level ?? MembershipLevel.STANDARD;

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          role: this.mapRegisterRole(user.role),
          status: user.status,
        },
        customer_profile: {
          membership_level: membershipLevel,
          points: customerProfile?.points,
          total_spent: customerProfile?.total_spent?.toString(),
          birth_date: customerProfile?.birth_date,
          gender: customerProfile?.gender,
          benefits: this.getMembershipBenefits(membershipLevel),
        }
      }
    }
  }

  // update profile
  async updateProfile(id: string, updateData: any): Promise<any> {
    const user = await this.findUserById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateData.full_name) user.full_name = updateData.full_name;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.avatar_url) user.avatar_url = updateData.avatar_url;

    await this.userRepo.save(user);
    return {
      success: true,
      message: 'Cập nhật thông tin thành công.',
    };
  }

  // lấy danh sách khách hàng
  async getAllCustomer(query: GetUsersQueryDto): Promise<GetUserResponseDto> {
    try {
      return this.getUserByRole(query, [UserRole.CUSTOMER], 'Lấy danh sách khách hàng thành công');
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Lấy danh sách nhân viên
  async getAllStaff(query: GetUsersQueryDto): Promise<GetUserResponseDto> {
    try {
      return this.getUserByRole(query, [UserRole.STAFF], 'Lấy danh sách nhân viên thành công');
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  

  // Tạo staff
  async createStaff(dto: CreateStaffDto): Promise<CreateStaffResponseDto> {
    const existingEmail = await this.findUserByEmail(dto.email);
    if (existingEmail) throw new BadRequestException('Email đã tồn tại');

    if (dto.phone) {
      const existingPhone = await this.findUserByPhone(dto.phone);
      if (existingPhone) throw new BadRequestException('Số điện thoại đã tồn tại');
    }


    const hashedPassword = bcrypt.hashSync(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password_hash: hashedPassword,
      full_name: dto.full_name,
      phone: dto.phone,
      avatar_url: dto.avatar_url,
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
    });
    await this.userRepo.save(user);
    return {
      success: true,
      data: {
        message: 'Tạo nhân viên thành công',
        staff: this.mapToUserItem(user),
      }
    }
  }

  

  async updateStatus(id: string, dto: UpdateUserStatusDto) : Promise<UpdateUserStatusResponseDto>{
    const user = await this.findUserById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    if (user.role === UserRole.ADMIN) throw new BadRequestException('Không thể cập nhật trạng thái tài khoản admin');

    user.status = dto.status;
    await this.userRepo.save(user);
    return {
      success: true,
      data: {
        message: `Đã cập nhật trạng thái tài khoản ${user.full_name} thành ${user.status}`
      }
    }
  }

  // phân ca
  // async shiftScheduling(){}

}
