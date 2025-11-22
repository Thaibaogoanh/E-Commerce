import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Design } from '../../entities/design.entity';
import { DesignAsset } from '../../entities/design-asset.entity';
import { DesignPlacement } from '../../entities/design-placement.entity';
import { DesignStatus } from '../../entities/design.entity';

@Injectable()
export class DesignsService {
  constructor(
    @InjectRepository(Design)
    private designRepository: Repository<Design>,
    @InjectRepository(DesignAsset)
    private designAssetRepository: Repository<DesignAsset>,
    @InjectRepository(DesignPlacement)
    private designPlacementRepository: Repository<DesignPlacement>,
  ) {}

  async findAll(filters?: {
    category?: string;
    tags?: string[];
    status?: DesignStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ designs: Design[]; total: number }> {
    const query = this.designRepository.createQueryBuilder('design')
      .leftJoinAndSelect('design.assets', 'assets')
      .leftJoinAndSelect('design.placements', 'placements');

    if (filters?.status) {
      query.andWhere('design.status = :status', { status: filters.status });
    } else {
      // Default: only show approved designs for public
      query.andWhere('design.status = :status', { status: DesignStatus.APPROVED });
    }

    if (filters?.category) {
      query.andWhere('design.design_tag LIKE :category', {
        category: `%${filters.category}%`,
      });
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

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }
    if (filters?.offset) {
      query.offset(filters.offset);
    }

    query.orderBy('design.createdAt', 'DESC');

    const designs = await query.getMany();

    return { designs, total };
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.designRepository.findOne({
      where: { DESIGN_ID: id },
      relations: ['assets', 'placements', 'placements.printMethod'],
    });

    if (!design) {
      throw new NotFoundException('Design not found');
    }

    return design;
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

  async findTrending(limit?: number): Promise<{ designs: Design[]; total: number }> {
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

    return { designs, total };
  }
}

