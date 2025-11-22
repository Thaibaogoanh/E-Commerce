import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Size } from './size.entity';
import { ColorOption } from './color-option.entity';
import { Stock } from './stock.entity';
import { OrderItem } from './order-item.entity';
import { Design } from './design.entity';

@Entity('sku_variants')
@Index(['productId', 'SizeCode', 'ColorCode'], { unique: true })
export class SkuVariant {
  @PrimaryGeneratedColumn('uuid')
  SkuID: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 20 })
  SizeCode: string;

  @Column({ type: 'varchar', length: 20 })
  ColorCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight_grams: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_cost: number;

  @Column({ type: 'varchar', length: 255 })
  sku_name: string;

  @Column({ type: 'varchar', length: 50, default: 'available' })
  avai_status: string; // available, out_of_stock, discontinued

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  designId: string; // Optional design for this SKU

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Product, (product) => product.skuVariants)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Size, (size) => size.skuVariants)
  @JoinColumn({ name: 'SizeCode', referencedColumnName: 'SizeCode' })
  size: Size;

  @ManyToOne(() => ColorOption, (colorOption) => colorOption.skuVariants)
  @JoinColumn({ name: 'ColorCode', referencedColumnName: 'ColorCode' })
  color: ColorOption;

  @OneToOne(() => Stock, (stock) => stock.skuVariant)
  stock: Stock;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.skuVariant)
  orderItems: OrderItem[];

  @ManyToOne(() => Design, (design) => design.skuVariants)
  @JoinColumn({ name: 'designId' })
  design: Design;
}

