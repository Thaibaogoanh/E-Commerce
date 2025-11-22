import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignsService } from './designs.service';
import { DesignsController } from './designs.controller';
import { Design } from '../../entities/design.entity';
import { DesignAsset } from '../../entities/design-asset.entity';
import { DesignPlacement } from '../../entities/design-placement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Design, DesignAsset, DesignPlacement])],
  controllers: [DesignsController],
  providers: [DesignsService],
  exports: [DesignsService],
})
export class DesignsModule {}

