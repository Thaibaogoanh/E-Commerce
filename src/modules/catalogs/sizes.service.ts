import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Size } from '../../entities/size.entity';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  findAll(): Promise<Size[]> {
    return this.sizeRepository.find();
  }

  async create(data: Partial<Size>): Promise<Size> {
    const size = this.sizeRepository.create(data);
    return this.sizeRepository.save(size);
  }

  async update(code: string, data: Partial<Size>): Promise<Size> {
    const size = await this.sizeRepository.findOne({
      where: { SizeCode: code },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    Object.assign(size, data);
    return this.sizeRepository.save(size);
  }

  async remove(code: string): Promise<void> {
    const size = await this.sizeRepository.findOne({
      where: { SizeCode: code },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    await this.sizeRepository.remove(size);
  }
}
