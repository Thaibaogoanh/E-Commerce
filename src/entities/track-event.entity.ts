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
import { Shipment } from './shipment.entity';

@Entity('track_events')
@Index(['shipmentId'])
export class TrackEvent {
  @PrimaryGeneratedColumn('uuid')
  TrackID: string;

  @Column({ type: 'uuid' })
  shipmentId: string;

  @Column({ type: 'varchar', length: 255 })
  status_text: string; // e.g., "Package received", "In transit", "Delivered"

  @Column({ type: 'timestamp' })
  even_time: Date; // Event time (note: typo in ERD but keeping for consistency)

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string; // e.g., "New York, NY", "Warehouse A"

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Shipment, (shipment) => shipment.trackEvents)
  @JoinColumn({ name: 'shipmentId', referencedColumnName: 'Ship_ID' })
  shipment: Shipment;
}

