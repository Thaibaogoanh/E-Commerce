import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnReason } from '../../entities/return-reason.entity';

@Injectable()
export class ReturnReasonsService {
  constructor(
    @InjectRepository(ReturnReason)
    private returnReasonRepository: Repository<ReturnReason>,
  ) {}

  findAll(): Promise<ReturnReason[]> {
    return this.returnReasonRepository.find();
  }

  async findOne(id: string): Promise<ReturnReason> {
    const reason = await this.returnReasonRepository.findOne({
      where: { Reason_code: id },
    });
    if (!reason) {
      throw new NotFoundException('Return reason not found');
    }
    return reason;
  }

  async create(data: Partial<ReturnReason>): Promise<ReturnReason> {
    const reason = this.returnReasonRepository.create(data);
    return this.returnReasonRepository.save(reason);
  }

  async update(id: string, data: Partial<ReturnReason>): Promise<ReturnReason> {
    const reason = await this.findOne(id);
    Object.assign(reason, data);
    return this.returnReasonRepository.save(reason);
  }

  async remove(id: string): Promise<void> {
    const reason = await this.findOne(id);
    await this.returnReasonRepository.remove(reason);
  }
}
