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
import { Cart } from './cart.entity';
import { Product } from './product.entity';
import { ColorOption } from './color-option.entity';
import { Design } from './design.entity';

@Entity('cart_items')
@Index(['cartId'])
@Index(['productId'])
@Index(['cartId', 'productId'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cartId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  colorCode: string;

  @Column({ type: 'uuid', nullable: true })
  designId: string;

  @Column({ type: 'int' })
  qty: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price_snapshot: number; // Price at time of adding to cart

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ColorOption, (colorOption) => colorOption.cartItems)
  @JoinColumn({ name: 'colorCode', referencedColumnName: 'ColorCode' })
  color: ColorOption;

  @ManyToOne(() => Design, (design) => design.cartItems)
  @JoinColumn({ name: 'designId', referencedColumnName: 'DESIGN_ID' })
  design: Design;

  // Alias for backward compatibility
  get quantity(): number {
    return this.qty;
  }

  set quantity(value: number) {
    this.qty = value;
  }

  get price(): number {
    return this.unit_price_snapshot;
  }

  set price(value: number) {
    this.unit_price_snapshot = value;
  }

  get subtotal(): number {
    return this.qty * this.unit_price_snapshot;
  }
}
