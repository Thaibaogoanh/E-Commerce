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
import { Design } from './design.entity';

@Entity('favorites')
@Index(['userId', 'productId'], { unique: true, where: '"designId" IS NULL' })
@Index(['userId', 'designId'], { unique: true, where: '"productId" IS NULL' })
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  productId: string; // For product favorites

  @Column({ type: 'uuid', nullable: true })
  designId: string; // For design favorites

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'userId', referencedColumnName: 'UserID' })
  user: User;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Design, { nullable: true })
  @JoinColumn({ name: 'designId', referencedColumnName: 'DESIGN_ID' })
  design: Design;
}

