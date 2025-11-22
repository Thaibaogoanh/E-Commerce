import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DesignAsset } from './design-asset.entity';
import { DesignPlacement } from './design-placement.entity';
import { SkuVariant } from './sku-variant.entity';
import { CartItem } from './cart-item.entity';
import { Review } from './review.entity';

export enum LicenseType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  EXCLUSIVE = 'exclusive',
}

export enum DesignStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
}

@Entity('designs')
export class Design {
  @PrimaryGeneratedColumn('uuid')
  DESIGN_ID: string;

  @Column({
    type: 'enum',
    enum: LicenseType,
    default: LicenseType.STANDARD,
  })
  license_type: LicenseType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  design_tag: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  preview_url: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at: Date;

  @Column({
    type: 'enum',
    enum: DesignStatus,
    default: DesignStatus.DRAFT,
  })
  status: DesignStatus;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => DesignAsset, (asset) => asset.design)
  assets: DesignAsset[];

  @OneToMany(() => DesignPlacement, (placement) => placement.design)
  placements: DesignPlacement[];

  @OneToMany(() => SkuVariant, (skuVariant) => skuVariant.design)
  skuVariants: SkuVariant[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.design)
  cartItems: CartItem[];

  @OneToMany(() => Review, (review) => review.design)
  reviews: Review[];
}

