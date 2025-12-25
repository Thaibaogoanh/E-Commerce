import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SkuVariant } from './sku-variant.entity';

@Entity('sizes')
export class Size {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  SizeCode: string; // e.g., "S", "M", "L", "XL"

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chest_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  length_cm: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender_fit: string; // e.g., "Male", "Female", "Unisex"

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => SkuVariant, (skuVariant) => skuVariant.size)
  skuVariants: SkuVariant[];
}
