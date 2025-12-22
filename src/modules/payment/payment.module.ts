import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from '../../entities/payment.entity';
import { VNPayGateway } from './gateways/vnpay.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, VNPayGateway],
  exports: [PaymentService],
})
export class PaymentModule {}

