import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { Order } from './order.entity';
import { Review } from './review.entity';
import { Cart } from './cart.entity';
import { SavedDesign } from './saved-design.entity';
import { Favorite } from './favorite.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  UserID: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dob: Date; // Date of birth

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  invitationCode: string; // Code used to invite this user

  @Column({ type: 'uuid', nullable: true })
  invitedById: string; // User who invited this user

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];

  @OneToOne(() => InvitationCode, (invitationCode) => invitationCode.owner)
  invitationCode: InvitationCode;

  @ManyToOne(() => InvitationCode, (invitationCode) => invitationCode.invitedUsers)
  @JoinColumn({ name: 'invitedById' })
  invitedBy: InvitationCode;

  @OneToMany(() => SavedDesign, (savedDesign) => savedDesign.user)
  savedDesigns: SavedDesign[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password_hash) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Alias for backward compatibility
  get id(): string {
    return this.UserID;
  }

  get password(): string {
    return this.password_hash;
  }

  set password(value: string) {
    this.password_hash = value;
  }

  get name(): string {
    return this.full_name;
  }

  set name(value: string) {
    this.full_name = value;
  }

  get isActive(): boolean {
    return this.is_active;
  }

  set isActive(value: boolean) {
    this.is_active = value;
  }
}
