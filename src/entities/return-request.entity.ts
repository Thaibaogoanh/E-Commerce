import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { ReturnReason } from './return-reason.entity';

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

@Entity('return_requests')
@Index(['orderId'])
export class ReturnRequest {
  @PrimaryGeneratedColumn('uuid')
  RET_ID: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar', length: 50 })
  reasonCode: string;

  @Column({ type: 'timestamp' })
  requested_at: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  refund_amount: number;

  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.PENDING,
  })
  status: ReturnStatus;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Order, (order) => order.returnRequests)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => ReturnReason, (reason) => reason.returnRequests)
  @JoinColumn({ name: 'reasonCode', referencedColumnName: 'Reason_code' })
  reason: ReturnReason;
}

