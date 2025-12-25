import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactStatus } from '../../entities/contact.entity';
import { CreateContactDto } from '../../dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(dto: CreateContactDto, userId?: string): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...dto,
      userId,
      status: ContactStatus.NEW,
    });
    return this.contactRepository.save(contact);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Contact[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.contactRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async updateStatus(
    id: string,
    status: ContactStatus,
    response?: string,
  ): Promise<Contact> {
    await this.contactRepository.update(id, { status, response });
    return this.findById(id);
  }

  async findByUser(userId: string): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.contactRepository.delete(id);
  }
}
