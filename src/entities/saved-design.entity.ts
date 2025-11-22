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

@Entity('saved_designs')
@Index(['userId'])
export class SavedDesign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  designId: string; // Optional: if using existing design

  @Column({ type: 'varchar', length: 255 })
  name: string; // User-given name for this saved design

  @Column({ type: 'jsonb' })
  canvasData: {
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
    selectedColor: string;
    selectedSize: string;
    quantity: number;
  };

  @Column({ type: 'varchar', length: 20 })
  colorCode: string;

  @Column({ type: 'varchar', length: 20 })
  sizeCode: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  calculatedPrice: number; // Price at time of saving

  @Column({ type: 'varchar', length: 500, nullable: true })
  previewUrl: string; // Preview image URL

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.savedDesigns)
  @JoinColumn({ name: 'userId', referencedColumnName: 'UserID' })
  user: User;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Design, { nullable: true })
  @JoinColumn({ name: 'designId', referencedColumnName: 'DESIGN_ID' })
  design: Design;
}

