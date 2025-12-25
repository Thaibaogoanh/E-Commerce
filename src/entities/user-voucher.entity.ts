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
import { User } from './user.entity';
import { Voucher } from './voucher.entity';
import { Order } from './order.entity';

export enum UserVoucherStatus {
  AVAILABLE = 'available',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity('user_vouchers')
@Index(['userId', 'voucherId'])
export class UserVoucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  voucherId: string;

  @Column({ type: 'uuid', nullable: true })
  orderId: string; // Order where this voucher was used

  @Column({
    type: 'enum',
    enum: UserVoucherStatus,
    default: UserVoucherStatus.AVAILABLE,
  })
  status: UserVoucherStatus;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'UserID' })
  user: User;

  @ManyToOne(() => Voucher, (voucher) => voucher.userVouchers)
  @JoinColumn({ name: 'voucherId' })
  voucher: Voucher;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
