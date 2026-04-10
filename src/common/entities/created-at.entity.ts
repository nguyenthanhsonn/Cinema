import { CreateDateColumn } from 'typeorm';

export abstract class CreatedAtEntity {
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
