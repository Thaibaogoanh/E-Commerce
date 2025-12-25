import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserVoucher } from './user-voucher.entity';

export enum VoucherType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

export enum VoucherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('vouchers')
@Index(['code'], { unique: true })
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: VoucherType,
  })
  type: VoucherType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // Percentage (0-100) or fixed amount in VND

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount: number; // Minimum order amount to use

  @Column({ type: 'int', nullable: true })
  maxUses: number; // Maximum number of times this voucher can be used

  @Column({ type: 'int', default: 0 })
  usedCount: number; // Number of times already used

  @Column({ type: 'int', nullable: true })
  maxUsesPerUser: number; // Maximum uses per user

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date' })
  validUntil: Date;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.ACTIVE,
  })
  status: VoucherStatus;

  @Column({ type: 'int', nullable: true })
  pointsRequired: number; // Points needed to redeem (if redeemable)

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => UserVoucher, (userVoucher) => userVoucher.voucher)
  userVouchers: UserVoucher[];
}
