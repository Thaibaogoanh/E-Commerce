import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity('packagings')
export class Packaging {
  @PrimaryGeneratedColumn('uuid')
  PKG_ID: string;

  @Column({ type: 'varchar', length: 255 })
  name: string; // e.g., "Small Box", "Large Box", "Envelope"

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  max_weight: number; // Maximum weight in grams

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Shipment, (shipment) => shipment.packaging)
  shipments: Shipment[];
}
