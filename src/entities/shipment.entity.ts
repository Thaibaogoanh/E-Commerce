import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Address } from './address.entity';
import { Packaging } from './packaging.entity';
import { TrackEvent } from './track-event.entity';

export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
}

@Entity('shipments')
@Index(['orderId'], { unique: true })
@Index(['addressId'])
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  Ship_ID: string;

  @Column({ type: 'uuid', unique: true })
  orderId: string;

  @Column({ type: 'uuid' })
  addressId: string;

  @Column({ type: 'uuid' })
  packagingId: string;

  @Column({ type: 'date', nullable: true })
  ship_date: Date;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Shipping_fee: number;

  @Column({ type: 'varchar', length: 100 })
  carrier: string; // e.g., "FedEx", "UPS", "DHL"

  @Column({ type: 'varchar', length: 100 })
  service_level: string; // e.g., "Standard", "Express", "Overnight"

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracking_number: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Order, (order) => order.shipment)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Address, (address) => address.shipments)
  @JoinColumn({ name: 'addressId', referencedColumnName: 'addr_id' })
  address: Address;

  @ManyToOne(() => Packaging, (packaging) => packaging.shipments)
  @JoinColumn({ name: 'packagingId', referencedColumnName: 'PKG_ID' })
  packaging: Packaging;

  @OneToMany(() => TrackEvent, (trackEvent) => trackEvent.shipment)
  trackEvents: TrackEvent[];
}

