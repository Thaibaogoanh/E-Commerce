import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Stock } from '../../entities/stock.entity';
import { StockMovement } from '../../entities/stock-movement.entity';
import { SkuVariant } from '../../entities/sku-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, StockMovement, SkuVariant])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
