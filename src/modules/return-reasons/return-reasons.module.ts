import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnReason } from '../../entities/return-reason.entity';
import { ReturnReasonsService } from './return-reasons.service';
import { ReturnReasonsController } from './return-reasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnReason])],
  controllers: [ReturnReasonsController],
  providers: [ReturnReasonsService],
  exports: [ReturnReasonsService],
})
export class ReturnReasonsModule {}
