import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../../entities/material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  findAll(): Promise<Material[]> {
    return this.materialRepository.find();
  }

  async create(data: Partial<Material>): Promise<Material> {
    const material = this.materialRepository.create(data);
    return this.materialRepository.save(material);
  }

  async update(id: string, data: Partial<Material>): Promise<Material> {
    const material = await this.materialRepository.findOne({ where: { MatID: id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    Object.assign(material, data);
    return this.materialRepository.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.materialRepository.findOne({ where: { MatID: id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    await this.materialRepository.remove(material);
  }
}
