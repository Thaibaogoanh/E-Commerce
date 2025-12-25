import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Favorite } from '../../entities/favorite.entity';
import { Product } from '../../entities/product.entity';
import { Design } from '../../entities/design.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Product, Design])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
