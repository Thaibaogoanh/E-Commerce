import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomizerService } from './customizer.service';
import { CustomizerController } from './customizer.controller';
import { SavedDesign } from '../../entities/saved-design.entity';
import { Product } from '../../entities/product.entity';
import { SkuVariant } from '../../entities/sku-variant.entity';
import { Design } from '../../entities/design.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedDesign, Product, SkuVariant, Design]),
  ],
  controllers: [CustomizerController],
  providers: [CustomizerService],
  exports: [CustomizerService],
})
export class CustomizerModule {}
