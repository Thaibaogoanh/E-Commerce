import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { SkuVariant } from './sku-variant.entity';
import { ShipmentItem } from './shipment-item.entity';

@Entity('order_items')
@Index(['orderId'])
@Index(['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid', nullable: true })
  productId: string; // Keep for backward compatibility

  @Column({ type: 'uuid' })
  skuId: string; // Link to SKU_VARIANT

  @Column({ type: 'int' })
  qty: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  colorCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sizeCode: string;

  @Column({ type: 'uuid', nullable: true })
  designId: string;

  @Column({ type: 'jsonb', nullable: true })
  customDesignData?: {
    elements: Array<{
      id: string;
      type: 'text' | 'image' | 'design';
      content: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      textAlign?: string;
    }>;
    color: string;
    size: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => SkuVariant, (skuVariant) => skuVariant.orderItems)
  @JoinColumn({ name: 'skuId', referencedColumnName: 'SkuID' })
  skuVariant: SkuVariant;

  @OneToMany(() => ShipmentItem, (shipmentItem) => shipmentItem.orderItem)
  shipmentItems: ShipmentItem[];

  // Alias for backward compatibility
  get quantity(): number {
    return this.qty;
  }

  set quantity(value: number) {
    this.qty = value;
  }

  get price(): number {
    return this.unit_price;
  }

  set price(value: number) {
    this.unit_price = value;
  }

  get subtotal(): number {
    return this.qty * this.unit_price;
  }
}
