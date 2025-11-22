import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SkuVariant } from './sku-variant.entity';

@Entity('stocks')
@Index(['skuId'], { unique: true })
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  StockID: string;

  @Column({ type: 'uuid', unique: true })
  skuId: string;

  @Column({ type: 'int', default: 0 })
  qty_outbound: number; // Quantity shipped/sold

  @Column({ type: 'int', default: 0 })
  qty_inbound: number; // Quantity received

  @Column({ type: 'int', default: 0 })
  qty_on_hand: number; // Current available quantity

  @Column({ type: 'int', default: 0 })
  qty_reserved: number; // Reserved for pending orders

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => SkuVariant, (skuVariant) => skuVariant.stock)
  @JoinColumn({ name: 'skuId', referencedColumnName: 'SkuID' })
  skuVariant: SkuVariant;
}

