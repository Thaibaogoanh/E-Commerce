import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { Voucher } from '../../entities/voucher.entity';
import { UserVoucher } from '../../entities/user-voucher.entity';
import { RewardCatalog } from '../../entities/reward-catalog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher, UserVoucher, RewardCatalog]),
  ],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}

