import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Favorite } from '../../entities/favorite.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async findAll(@Request() req): Promise<Favorite[]> {
    return this.favoritesService.findAll(req.user.id);
  }

  @Post()
  async addFavorite(
    @Request() req,
    @Body() favoriteData: { productId?: string; designId?: string },
  ): Promise<Favorite> {
    return this.favoritesService.addFavorite(req.user.id, favoriteData);
  }

  @Delete(':id')
  async removeFavorite(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.favoritesService.removeFavorite(req.user.id, id);
    return { message: 'Removed from favorites' };
  }

  @Delete()
  async removeFavoriteByItem(
    @Request() req,
    @Query('productId') productId?: string,
    @Query('designId') designId?: string,
  ): Promise<{ message: string }> {
    await this.favoritesService.removeFavoriteByItem(req.user.id, {
      productId,
      designId,
    });
    return { message: 'Removed from favorites' };
  }

  @Get('check')
  async isFavorited(
    @Request() req,
    @Query('productId') productId?: string,
    @Query('designId') designId?: string,
  ): Promise<{ isFavorited: boolean }> {
    const isFavorited = await this.favoritesService.isFavorited(req.user.id, {
      productId,
      designId,
    });
    return { isFavorited };
  }
}
