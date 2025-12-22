import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../../entities/asset.entity';
import { AssetDisposal } from '../../entities/asset-disposal.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(AssetDisposal)
    private disposalRepository: Repository<AssetDisposal>,
  ) {}

  findAll(): Promise<Asset[]> {
    return this.assetRepository.find();
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async create(data: Partial<Asset>): Promise<Asset> {
    const asset = this.assetRepository.create(data);
    return this.assetRepository.save(asset);
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset> {
    const asset = await this.findOne(id);
    Object.assign(asset, data);
    return this.assetRepository.save(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepository.remove(asset);
  }

  async dispose(
    assetId: string,
    payload: { reason: string; note?: string; disposedBy?: string },
  ): Promise<AssetDisposal> {
    const asset = await this.findOne(assetId);
    const disposal = this.disposalRepository.create({
      assetId: asset.id,
      reason: payload.reason,
      note: payload.note,
      disposedBy: payload.disposedBy,
    });
    return this.disposalRepository.save(disposal);
  }

  async getDisposals(assetId: string): Promise<AssetDisposal[]> {
    await this.findOne(assetId);
    return this.disposalRepository.find({
      where: { assetId },
      order: { createdAt: 'DESC' },
    });
  }
}
