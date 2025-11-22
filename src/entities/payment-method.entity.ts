import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Payment } from './payment.entity';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export enum PaymentMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('payment_methods')
@Index(['userId'])
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  MethodID: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
  })
  method: PaymentMethodType;

  @Column({
    type: 'enum',
    enum: PaymentMethodStatus,
    default: PaymentMethodStatus.ACTIVE,
  })
  status: PaymentMethodStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  card_no: string; // Last 4 digits or masked

  @Column({ type: 'varchar', length: 100, nullable: true })
  card_holder_name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  expiry_date: string; // MM/YY format

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.paymentMethods)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.paymentMethod)
  payments: Payment[];
}

