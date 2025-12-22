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
import { OrderItem } from './order-item.entity';

@Entity('shipment_items')
@Index(['shipmentId'])
@Index(['orderItemId'])
export class ShipmentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  shipmentId: string;

  @Column({ type: 'uuid' })
  orderItemId: string;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipmentId', referencedColumnName: 'Ship_ID' })
  shipment: Shipment;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.shipmentItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderItemId', referencedColumnName: 'id' })
  orderItem: OrderItem;
}
