import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { ColorOption } from './color-option.entity';

export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  DESIGNER = 'designer',
}

@Entity('employees')
@Index(['taxID'], { unique: true })
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  taxID: string;

  @Column({ type: 'varchar', length: 50 })
  shift: string; // e.g., "Morning", "Evening", "Night"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.STAFF,
  })
  role: EmployeeRole;

  @Column({ type: 'date' })
  join_date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => ColorOption, (colorOption) => colorOption.managers)
  @JoinTable({
    name: 'employee_color_management',
    joinColumn: { name: 'employeeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'colorCode', referencedColumnName: 'ColorCode' },
  })
  managedColors: ColorOption[];
}
