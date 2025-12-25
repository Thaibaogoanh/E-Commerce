import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RewardType {
  VOUCHER = 'voucher',
  DISCOUNT = 'discount',
  FREE_PRODUCT = 'free_product',
  FREE_SHIPPING = 'free_shipping',
}

@Entity('reward_catalog')
export class RewardCatalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: RewardType,
  })
  type: RewardType;

  @Column({ type: 'int' })
  pointsRequired: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue: number; // For discount type

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount: number; // Minimum order to use

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  redemptionCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
