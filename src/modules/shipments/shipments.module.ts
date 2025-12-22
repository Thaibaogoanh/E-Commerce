import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from '../../entities/shipment.entity';
import { TrackEvent } from '../../entities/track-event.entity';
import { Order } from '../../entities/order.entity';
import { ShipmentItem } from '../../entities/shipment-item.entity';
import { OrderItem } from '../../entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, TrackEvent, Order, ShipmentItem, OrderItem]),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}

