import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/status.enum';

@Entity('users')
export class User extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string;

  @Column({ type: 'varchar', length: 160 })
  full_name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_url: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  // Nguon dang nhap (local | google).
  // Dung de phan biet login bang mat khau hay social login.
  @Column({ type: 'varchar', length: 20, name: 'auth_provider', default: 'local' })
  authProvider: 'local' | 'google';

  // ID tu nha cung cap (vd: Google sub/id). Chi co khi auth_provider != local.
  @Column({ type: 'varchar', length: 255, name: 'provider_id', nullable: true })
  providerId: string | null;

  @Column({ type: 'varchar', name: 'refresh_token', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'varchar', name: 'password_reset_token_hash', nullable: true })
  passwordResetTokenHash: string | null;

  @Column({
    type: 'timestamp',
    name: 'password_reset_token_expires_at',
    nullable: true,
  })
  passwordResetTokenExpiresAt: Date | null;
}
