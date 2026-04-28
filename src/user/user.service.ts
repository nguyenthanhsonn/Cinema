import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DataSource} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enums/user-role.enum';
import { CustomerProfileResponseDto } from './dto/customer-profile.dto';
import { CustomerProfile } from './entities/customer-profile.entity';
import { MembershipLevel } from './enums/membership-level.enum';

@Injectable()
export class UserService {
  
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource
  ){}
  // Map role sang string
    private mapRegisterRole(role: UserRole): 'customer' | 'admin' | 'staff' {
      if (role === UserRole.ADMIN) return 'admin';
      if (role === UserRole.STAFF) return 'staff';
      return 'customer';
    }

  // Tìm user theo email
  async findUserByEmail(email: string) : Promise<User | null>{
    return this.userRepo.findOne({where: {email}})
  }

  async findUserById(id: string) : Promise<User | null>{
    return this.userRepo.findOne({where: {id}})
  }

  async findUserByPhone(phone: string) : Promise<User | null>{
    return this.userRepo.findOne({where: {phone}});
  }

  // Cập nhật refresh token.
  // Dùng `string | null` để hỗ trợ cả 2 trường hợp:
  // - login/refresh: lưu token mới
  // - logout: xóa token khỏi DB bằng null
  async updateRefreshToken(email: string, refresh_token: string | null) : Promise<User>{
    const user = await this.findUserByEmail(email)
    if(!user) throw new Error('User not found')
    user.refreshToken = refresh_token
    return this.userRepo.save(user)
  }

  // update password for user
  async updatePass(id: string, newPass: string) : Promise<User>{
    const user = await this.findUserById(id)
    if(!user) throw new Error('User not found')
    user.password_hash = bcrypt.hashSync(newPass, 10)
    return this.userRepo.save(user)
  }
  // Lưu refresh token
  async saveRefreshToken(email: string, refresh_token: string) : Promise<User>{
    const user = await this.findUserByEmail(email)
    if(!user) throw new Error('User not found')
    user.refreshToken = refresh_token
    return this.userRepo.save(user)
  }

  // customer profile
  async getMe(id: string) : Promise<CustomerProfileResponseDto>{
    const user = await this.findUserById(id)
    if(!user) throw new NotFoundException('User not found')
    const customerProfile = await this.dataSource.getRepository(CustomerProfile).findOneBy({user_id: id});
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
          membership_level: customerProfile?.membership_level ?? MembershipLevel.STANDARD,
          points: customerProfile?.points,
          total_spent: customerProfile?.total_spent?.toString(),
          birth_date: customerProfile?.birth_date,
          gender: customerProfile?.gender,
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

}
