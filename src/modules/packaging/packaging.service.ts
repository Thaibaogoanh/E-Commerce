import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Packaging } from '../../entities/packaging.entity';

@Injectable()
export class PackagingService {
  constructor(
    @InjectRepository(Packaging)
    private packagingRepository: Repository<Packaging>,
  ) {}

  findAll(): Promise<Packaging[]> {
    return this.packagingRepository.find();
  }

  async findOne(id: string): Promise<Packaging> {
    const item = await this.packagingRepository.findOne({
      where: { PKG_ID: id },
    });
    if (!item) {
      throw new NotFoundException('Packaging not found');
    }
    return item;
  }

  async create(data: Partial<Packaging>): Promise<Packaging> {
    const item = this.packagingRepository.create(data);
    return this.packagingRepository.save(item);
  }

  async update(id: string, data: Partial<Packaging>): Promise<Packaging> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.packagingRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.packagingRepository.remove(item);
  }
}
