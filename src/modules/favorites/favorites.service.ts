import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../entities/favorite.entity';
import { Product } from '../../entities/product.entity';
import { Design } from '../../entities/design.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Design)
    private designRepository: Repository<Design>,
  ) {}

  async findAll(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['product', 'design'],
      order: { createdAt: 'DESC' },
    });
  }

  async addFavorite(
    userId: string,
    favoriteData: { productId?: string; designId?: string },
  ): Promise<Favorite> {
    if (!favoriteData.productId && !favoriteData.designId) {
      throw new BadRequestException(
        'Either productId or designId must be provided',
      );
    }

    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: {
        userId,
        productId: favoriteData.productId || null,
        designId: favoriteData.designId || null,
      },
    });

    if (existing) {
      throw new ConflictException('Already in favorites');
    }

    // Verify product/design exists
    if (favoriteData.productId) {
      const product = await this.productRepository.findOne({
        where: { id: favoriteData.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    }

    if (favoriteData.designId) {
      const design = await this.designRepository.findOne({
        where: { DESIGN_ID: favoriteData.designId },
      });
      if (!design) {
        throw new NotFoundException('Design not found');
      }
    }

    const favorite = this.favoriteRepository.create({
      ...favoriteData,
      userId,
    });

    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(
    userId: string,
    favoriteId: string,
  ): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id: favoriteId, userId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async removeFavoriteByItem(
    userId: string,
    itemData: { productId?: string; designId?: string },
  ): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        userId,
        productId: itemData.productId || null,
        designId: itemData.designId || null,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async isFavorited(
    userId: string,
    itemData: { productId?: string; designId?: string },
  ): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        userId,
        productId: itemData.productId || null,
        designId: itemData.designId || null,
      },
    });

    return !!favorite;
  }
}

