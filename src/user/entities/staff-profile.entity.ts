import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { TimestampedEntity } from '../../common/entities/timestamped.entity';
import { Cinema } from '../../cinema/entities/cinema.entity';
import { User } from './user.entity';

@Entity('staff_profiles')
export class StaffProfile extends TimestampedEntity {
  @PrimaryColumn('uuid')
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  employee_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  job_title: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  cinema_id: string | null;

  @ManyToOne(() => Cinema, (cinema) => cinema.staff_profiles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cinema_id' })
  cinema: Cinema | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shift_name: string | null;

  @Column({ type: 'time', nullable: true })
  shift_start: string | null;

  @Column({ type: 'time', nullable: true })
  shift_end: string | null;
}
