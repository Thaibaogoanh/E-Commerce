import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Asset } from './asset.entity';
import { User } from './user.entity';

@Entity('asset_disposals')
@Index(['assetId'])
export class AssetDisposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assetId: string;

  @Column({ type: 'uuid', nullable: true })
  disposedBy: string;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Asset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  asset: Asset;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'disposedBy', referencedColumnName: 'UserID' })
  disposer: User;
}
