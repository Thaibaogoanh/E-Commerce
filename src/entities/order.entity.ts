import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Shipment } from './shipment.entity';
import { Payment } from './payment.entity';
import { Review } from './review.entity';
import { ReturnRequest } from './return-request.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('orders')
@Index(['userId'])
@Index(['status'])
@Index(['paymentStatus'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  Status: OrderStatus;

  @Column({ type: 'date' })
  Order_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  Discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Total: number;

  @Column({ type: 'text' })
  shippingAddress: string;

  @Column({ type: 'varchar', length: 100 })
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trackingNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId', referencedColumnName: 'UserID' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @OneToOne(() => Shipment, (shipment) => shipment.order)
  shipment: Shipment;

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;

  @OneToMany(() => Review, (review) => review.order)
  reviews: Review[];

  @OneToMany(() => ReturnRequest, (returnRequest) => returnRequest.order)
  returnRequests: ReturnRequest[];

  // Alias for backward compatibility
  get status(): OrderStatus {
    return this.Status;
  }

  set status(value: OrderStatus) {
    this.Status = value;
  }

  get totalAmount(): number {
    return this.Total;
  }

  set totalAmount(value: number) {
    this.Total = value;
  }

  get createdAt(): Date {
    return this.Order_date;
  }
}

