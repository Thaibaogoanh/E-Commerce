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
import { Product } from './product.entity';
import { Order } from './order.entity';
import { Design } from './design.entity';

@Entity('reviews')
@Index(['userId'])
@Index(['productId'])
@Index(['orderId'])
@Index(['rating'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  REVIEW_ID: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @Column({ type: 'uuid', nullable: true })
  designId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  media_url: string; // URL to review media/images

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId', referencedColumnName: 'UserID' })
  user: User;

  @ManyToOne(() => Product, (product) => product.reviews)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Order, (order) => order.reviews)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Design, (design) => design.reviews)
  @JoinColumn({ name: 'designId', referencedColumnName: 'DESIGN_ID' })
  design: Design;

  // Alias for backward compatibility
  get id(): string {
    return this.REVIEW_ID;
  }
}
