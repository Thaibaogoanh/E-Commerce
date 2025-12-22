import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Review } from './review.entity';
import { OrderItem } from './order-item.entity';
import { Material } from './material.entity';
import { SkuVariant } from './sku-variant.entity';

@Entity('products')
@Index(['title'])
@Index(['categoryId'])
@Index(['isNew'])
@Index(['isFeatured'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  care_instructions: string;

  @Column({ type: 'simple-array', nullable: true })
  design_areas: string[]; // e.g., ["Front", "Back", "Sleeve"]

  @Column({ type: 'jsonb', nullable: true })
  printArea: {
    top: number; // Percentage from top
    left: number; // Percentage from left
    width: number; // Percentage width
    height: number; // Percentage height
  };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({ type: 'simple-array', default: [] })
  images: string[];

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isNew: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  numReviews: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @ManyToMany(() => Material, (material) => material.products)
  @JoinTable({
    name: 'product_materials',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'materialId', referencedColumnName: 'MatID' },
  })
  materials: Material[];

  @OneToMany(() => SkuVariant, (skuVariant) => skuVariant.product)
  skuVariants: SkuVariant[];
}
