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
import { Order } from './order.entity';

export enum PointType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
}

export enum PointSource {
  PURCHASE = 'purchase',
  ECO_PRODUCT_BONUS = 'eco_product_bonus',
  REVIEW = 'review',
  REFERRAL = 'referral',
  WELCOME_BONUS = 'welcome_bonus',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  VOUCHER_REDEMPTION = 'voucher_redemption',
}

@Entity('reward_points')
@Index(['userId'])
@Index(['orderId'])
export class RewardPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  orderId: string; // Order that earned/redeemed points

  @Column({
    type: 'enum',
    enum: PointType,
  })
  type: PointType;

  @Column({
    type: 'enum',
    enum: PointSource,
  })
  source: PointSource;

  @Column({ type: 'int' })
  points: number; // Positive for earned, negative for redeemed

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date; // Points expiry date

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'UserID' })
  user: User;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
