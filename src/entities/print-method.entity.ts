import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DesignPlacement } from './design-placement.entity';

@Entity('print_methods')
export class PrintMethod {
  @PrimaryGeneratedColumn('uuid')
  PM_ID: string;

  @Column({ type: 'varchar', length: 255 })
  name: string; // e.g., "Screen Print", "DTG", "Embroidery"

  @Column({ type: 'int', nullable: true })
  min_resolution_dpi: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => DesignPlacement, (placement) => placement.printMethod)
  placements: DesignPlacement[];
}
