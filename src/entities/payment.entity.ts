import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Order } from './order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
@Index(['orderId'], { unique: true })
@Index(['paymentMethodId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  PaymentID: string;

  @Column({ type: 'uuid' })
  paymentMethodId: string;

  @Column({ type: 'uuid', unique: true })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  txn_ref: string; // Transaction reference from payment gateway

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.payments)
  @JoinColumn({ name: 'paymentMethodId', referencedColumnName: 'MethodID' })
  paymentMethod: PaymentMethod;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}

