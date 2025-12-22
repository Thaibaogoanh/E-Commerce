import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Stock } from './stock.entity';

export enum StockMovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  RESERVE = 'reserve',
  RELEASE = 'release',
  ADJUST = 'adjust',
}

@Entity('stock_movements')
@Index(['stockId'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  stockId: string;

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceType: string; // e.g., order, shipment, return

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Stock, (stock) => stock.movements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stockId', referencedColumnName: 'StockID' })
  stock: Stock;
}
