import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { RewardPoint } from '../../entities/reward-point.entity';
import { RewardCatalog } from '../../entities/reward-catalog.entity';
import { User } from '../../entities/user.entity';
import { VouchersModule } from '../vouchers/vouchers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardPoint,
      RewardCatalog,
      User,
    ]),
    VouchersModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}

