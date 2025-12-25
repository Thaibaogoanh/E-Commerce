import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from '../../entities/design.entity';
import { DesignAsset } from '../../entities/design-asset.entity';
import { DesignPlacement } from '../../entities/design-placement.entity';
import { DesignStatus } from '../../entities/design.entity';
import { Neo4jService } from '../../config/neo4j.config';
import { Logger } from '@nestjs/common';

@Injectable()
export class DesignsService {
  private readonly logger = new Logger(DesignsService.name);

  constructor(
    @InjectRepository(Design)
    private designRepository: Repository<Design>,
    @InjectRepository(DesignAsset)
    private designAssetRepository: Repository<DesignAsset>,
    @InjectRepository(DesignPlacement)
    private designPlacementRepository: Repository<DesignPlacement>,
    private neo4jService: Neo4jService,
  ) {}

  async findAll(filters?: {
    category?: string;
    categoryId?: string;
    tags?: string[];
    status?: DesignStatus;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'createdAt' | 'likes' | 'downloads';
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }): Promise<{ designs: Design[]; total: number }> {
    const query = this.designRepository
      .createQueryBuilder('design')
      .leftJoinAndSelect('design.assets', 'assets')
      .leftJoinAndSelect('design.placements', 'placements')
      .leftJoinAndSelect('design.category', 'category');

    if (filters?.status) {
      query.andWhere('design.status = :status', { status: filters.status });
    } else {
      // Default: only show approved designs for public
      query.andWhere('design.status = :status', {
        status: DesignStatus.APPROVED,
      });
    }

    if (filters?.categoryId) {
      query.andWhere('design.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    } else if (filters?.category) {
      // Fallback: filter by category name or design_tag
      query.andWhere(
        '(design.design_tag LIKE :category OR category.name LIKE :category)',
        {
          category: `%${filters.category}%`,
        },
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.andWhere('design.design_tag IN (:...tags)', { tags: filters.tags });
    }

    if (filters?.search) {
      query.andWhere(
        '(design.title LIKE :search OR design.description LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Price range filter
    if (filters?.minPrice !== undefined) {
      query.andWhere('design.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters?.maxPrice !== undefined) {
      query.andWhere('design.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }
    if (filters?.offset) {
      query.offset(filters.offset);
    }

    // Sorting
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'DESC';
    const validSortColumns = ['price', 'createdAt', 'likes', 'downloads'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    query.orderBy(`design.${safeSortBy}`, sortOrder);

    const designs = await query.getMany();

    // Transform designs to ensure price is a number (not string from decimal)
    const transformedDesigns = designs.map((design) => {
      const transformed = { ...design };
      if (design.price !== null && design.price !== undefined) {
        (transformed as any).price = Number(design.price);
      }
      if (design.stock !== null && design.stock !== undefined) {
        (transformed as any).stock = Number(design.stock);
      }
      if (design.quantity !== null && design.quantity !== undefined) {
        (transformed as any).quantity = Number(design.quantity);
      }
      return transformed;
    });

    return { designs: transformedDesigns as Design[], total };
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.designRepository.findOne({
      where: { DESIGN_ID: id },
      relations: [
        'assets',
        'placements',
        'placements.printMethod',
        'category',
      ],
    });

    if (!design) {
      throw new NotFoundException('Design not found');
    }

    // Transform to ensure price is a number
    const transformed = { ...design };
    if (design.price !== null && design.price !== undefined) {
      (transformed as any).price = Number(design.price);
    }
    if (design.stock !== null && design.stock !== undefined) {
      (transformed as any).stock = Number(design.stock);
    }
    if (design.quantity !== null && design.quantity !== undefined) {
      (transformed as any).quantity = Number(design.quantity);
    }
    return transformed as Design;
  }

  async create(designData: Partial<Design>): Promise<Design> {
    const design = this.designRepository.create({
      ...designData,
      status: DesignStatus.PENDING,
    });

    return this.designRepository.save(design);
  }

  async update(id: string, updateData: Partial<Design>): Promise<Design> {
    const design = await this.findOne(id);
    Object.assign(design, updateData);
    return this.designRepository.save(design);
  }

  async approve(id: string): Promise<Design> {
    const design = await this.findOne(id);
    design.status = DesignStatus.APPROVED;
    design.approved_at = new Date();
    return this.designRepository.save(design);
  }

  async reject(id: string): Promise<Design> {
    const design = await this.findOne(id);
    design.status = DesignStatus.REJECTED;
    return this.designRepository.save(design);
  }

  async findTrending(
    limit?: number,
  ): Promise<{ designs: Design[]; total: number }> {
    const query = this.designRepository
      .createQueryBuilder('design')
      .leftJoinAndSelect('design.assets', 'assets')
      .where('design.status = :status', { status: DesignStatus.APPROVED })
      .orderBy('design.downloads', 'DESC')
      .addOrderBy('design.createdAt', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    const designs = await query.getMany();
    const total = await this.designRepository.count({
      where: { status: DesignStatus.APPROVED },
    });

    // Transform designs to ensure price is a number
    const transformedDesigns = designs.map((design) => {
      const transformed = { ...design };
      if (design.price !== null && design.price !== undefined) {
        (transformed as any).price = Number(design.price);
      }
      if (design.stock !== null && design.stock !== undefined) {
        (transformed as any).stock = Number(design.stock);
      }
      if (design.quantity !== null && design.quantity !== undefined) {
        (transformed as any).quantity = Number(design.quantity);
      }
      return transformed;
    });

    return { designs: transformedDesigns as Design[], total };
  }

  /**
   * Get recommended designs for user (Personalized AI Recommendations)
   */
  async getRecommendedForUser(
    userId: string,
    limit: number = 5,
  ): Promise<Design[]> {
    try {
      if (!this.neo4jService.isReady()) {
        // Fallback: return trending designs
        return this.getTrendingDesigns(limit);
      }

      const recommended = await this.neo4jService.getRecommendedDesigns(
        userId,
        limit * 2, // Get more to filter
      );

      if (recommended.length === 0) {
        // No recommendations, fallback to trending
        return this.getTrendingDesigns(limit);
      }

      const designs = await Promise.all(
        recommended.map((item) =>
          this.designRepository.findOne({
            where: { DESIGN_ID: item.id, status: DesignStatus.APPROVED },
            relations: ['assets', 'category'],
          }),
        ),
      );

      const validDesigns = designs.filter((d) => d !== null);

      // If we don't have enough, fill with trending
      if (validDesigns.length < limit) {
        const trending = await this.getTrendingDesigns(
          limit - validDesigns.length,
        );
        // Avoid duplicates
        const existingIds = new Set(validDesigns.map((d) => d.DESIGN_ID));
        const additional = trending.filter(
          (d) => !existingIds.has(d.DESIGN_ID),
        );
        return [...validDesigns, ...additional].slice(0, limit);
      }

      return validDesigns.slice(0, limit);
    } catch (error) {
      this.logger.warn(`Error getting design recommendations: ${error.message}`);
      // Fallback to trending on error
      return this.getTrendingDesigns(limit);
    }
  }

  /**
   * Get trending designs (fallback for recommendations)
   */
  private async getTrendingDesigns(limit: number): Promise<Design[]> {
    const designs = await this.designRepository.find({
      where: { status: DesignStatus.APPROVED },
      relations: ['assets', 'category'],
      order: { downloads: 'DESC', likes: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
    return designs;
  }
}
