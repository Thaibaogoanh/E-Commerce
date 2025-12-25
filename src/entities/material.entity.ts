import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  MatID: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true })
  wash_care_rating: number; // 1-5 rating

  @Column({ type: 'boolean', default: false })
  is_recycled: boolean;

  @Column({ type: 'text', nullable: true })
  composition: string; // e.g., "100% Cotton"

  @Column({ type: 'int', nullable: true })
  grammage_gsm: number; // Grams per square meter

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'boolean', default: false })
  stretchable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToMany(() => Product, (product) => product.materials)
  @JoinTable({
    name: 'product_materials',
    joinColumn: { name: 'materialId', referencedColumnName: 'MatID' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];
}
