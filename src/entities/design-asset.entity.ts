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

@Entity('design_assets')
@Index(['designId'])
export class DesignAsset {
  @PrimaryGeneratedColumn('uuid')
  ASSET_ID: string;

  @Column({ type: 'uuid' })
  designId: string;

  @Column({ type: 'varchar', length: 500 })
  file_url: string;

  @Column({ type: 'varchar', length: 100 })
  mime: string; // MIME type

  @Column({ type: 'int', nullable: true })
  width_px: number;

  @Column({ type: 'int', nullable: true })
  height_px: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Design, (design) => design.assets)
  @JoinColumn({ name: 'designId', referencedColumnName: 'DESIGN_ID' })
  design: Design;
}
