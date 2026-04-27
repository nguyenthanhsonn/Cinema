import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { MembershipLevel } from '../enums/membership-level.enum';
import { User } from './user.entity';
import { Gender } from '../enums/gender.enum';

@Entity('customer_profiles')
export class CustomerProfile extends TimestampedEntity {
  @PrimaryColumn('uuid')
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: MembershipLevel,
    default: MembershipLevel.STANDARD,
  })
  membership_level: MembershipLevel;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: '0',
    transformer: {
      to: (val: number) => val,
      from: (val: string) => parseFloat(val),
    },
  })
  total_spent: number;

  @Column({ type: 'date', nullable: true })
  birth_date: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;
}
