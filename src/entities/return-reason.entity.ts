import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ReturnRequest } from './return-request.entity';

@Entity('return_reasons')
export class ReturnReason {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  Reason_code: string; // e.g., "DEFECTIVE", "WRONG_SIZE", "NOT_AS_DESCRIBED"

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => ReturnRequest, (returnRequest) => returnRequest.reason)
  returnRequests: ReturnRequest[];
}
