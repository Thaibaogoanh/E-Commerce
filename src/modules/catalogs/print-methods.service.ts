import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrintMethod } from '../../entities/print-method.entity';

@Injectable()
export class PrintMethodsService {
  constructor(
    @InjectRepository(PrintMethod)
    private printMethodRepository: Repository<PrintMethod>,
  ) {}

  findAll(): Promise<PrintMethod[]> {
    return this.printMethodRepository.find();
  }

  async create(data: Partial<PrintMethod>): Promise<PrintMethod> {
    const pm = this.printMethodRepository.create(data);
    return this.printMethodRepository.save(pm);
  }

  async update(id: string, data: Partial<PrintMethod>): Promise<PrintMethod> {
    const pm = await this.printMethodRepository.findOne({
      where: { PM_ID: id },
    });
    if (!pm) {
      throw new NotFoundException('Print method not found');
    }
    Object.assign(pm, data);
    return this.printMethodRepository.save(pm);
  }

  async remove(id: string): Promise<void> {
    const pm = await this.printMethodRepository.findOne({
      where: { PM_ID: id },
    });
    if (!pm) {
      throw new NotFoundException('Print method not found');
    }
    await this.printMethodRepository.remove(pm);
  }
}
