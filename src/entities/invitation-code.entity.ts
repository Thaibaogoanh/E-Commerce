import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('invitation_codes')
@Index(['Code'], { unique: true })
export class InvitationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  Code: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string; // Customer who owns this code

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @OneToOne(() => User, (user) => user.invitationCode)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => User, (user) => user.invitedBy)
  invitedUsers: User[];
}
