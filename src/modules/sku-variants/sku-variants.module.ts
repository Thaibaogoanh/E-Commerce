import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkuVariantsService } from './sku-variants.service';
import { SkuVariantsController } from './sku-variants.controller';
import { SkuVariant } from '../../entities/sku-variant.entity';
import { Product } from '../../entities/product.entity';
import { Size } from '../../entities/size.entity';
import { ColorOption } from '../../entities/color-option.entity';
import { Stock } from '../../entities/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkuVariant, Product, Size, ColorOption, Stock]),
  ],
  controllers: [SkuVariantsController],
  providers: [SkuVariantsService],
  exports: [SkuVariantsService],
})
export class SkuVariantsModule {}
