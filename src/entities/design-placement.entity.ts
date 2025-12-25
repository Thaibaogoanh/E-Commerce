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
import { Design } from './design.entity';
import { PrintMethod } from './print-method.entity';

@Entity('design_placements')
@Index(['designId'])
export class DesignPlacement {
  @PrimaryGeneratedColumn('uuid')
  PlacementID: string;

  @Column({ type: 'uuid' })
  designId: string;

  @Column({ type: 'uuid' })
  printMethodId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  color_profile: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  pos_x_cm: number; // X position in centimeters

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  pos_y_cm: number; // Y position in centimeters

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width_cm: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height_cm: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  print_area: string; // e.g., "Front", "Back", "Sleeve"

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Design, (design) => design.placements)
  @JoinColumn({ name: 'designId', referencedColumnName: 'DESIGN_ID' })
  design: Design;

  @ManyToOne(() => PrintMethod, (printMethod) => printMethod.placements)
  @JoinColumn({ name: 'printMethodId', referencedColumnName: 'PM_ID' })
  printMethod: PrintMethod;
}
