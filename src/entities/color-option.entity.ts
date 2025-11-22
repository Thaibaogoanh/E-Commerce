import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  Index,
} from 'typeorm';
import { SkuVariant } from './sku-variant.entity';
import { CartItem } from './cart-item.entity';
import { Employee } from './employee.entity';

@Entity('color_options')
export class ColorOption {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  ColorCode: string; // e.g., "RED", "BLUE", "BLACK"

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 7 })
  hex: string; // Hex color code

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => SkuVariant, (skuVariant) => skuVariant.color)
  skuVariants: SkuVariant[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.color)
  cartItems: CartItem[];

  @ManyToMany(() => Employee, (employee) => employee.managedColors)
  managers: Employee[];
}

