import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { SkuVariant } from '../../entities/sku-variant.entity';
import { Stock } from '../../entities/stock.entity';
import { EmailService } from '../../services/email.service';
import { InventoryModule } from '../inventory/inventory.module';
import { Neo4jService } from '../../config/neo4j.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      User,
      SkuVariant,
      Stock,
    ]),
    InventoryModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, EmailService, Neo4jService],
  exports: [OrdersService],
})
export class OrdersModule {}
