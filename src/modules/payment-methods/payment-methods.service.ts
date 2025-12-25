import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../../entities/payment-method.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(userId: string): Promise<PaymentMethod[]> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.paymentMethodRepository.find({
      where: { userId },
      order: { is_default: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, methodId: string): Promise<PaymentMethod> {
    const method = await this.paymentMethodRepository.findOne({
      where: { MethodID: methodId, userId },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    return method;
  }

  async create(
    userId: string,
    methodData: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If this is set as default, unset other defaults
    if (methodData.is_default) {
      await this.paymentMethodRepository.update(
        { userId, is_default: true },
        { is_default: false },
      );
    }

    const method = this.paymentMethodRepository.create({
      ...methodData,
      userId,
    });

    return this.paymentMethodRepository.save(method);
  }

  async update(
    userId: string,
    methodId: string,
    updateData: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    const method = await this.findOne(userId, methodId);

    // If setting as default, unset other defaults
    if (updateData.is_default && !method.is_default) {
      await this.paymentMethodRepository.update(
        { userId, is_default: true },
        { is_default: false },
      );
    }

    Object.assign(method, updateData);
    return this.paymentMethodRepository.save(method);
  }

  async remove(userId: string, methodId: string): Promise<void> {
    const method = await this.findOne(userId, methodId);
    await this.paymentMethodRepository.remove(method);
  }

  async setDefault(userId: string, methodId: string): Promise<PaymentMethod> {
    const method = await this.findOne(userId, methodId);

    // Unset all other defaults
    await this.paymentMethodRepository.update(
      { userId, is_default: true },
      { is_default: false },
    );

    // Set this as default
    method.is_default = true;
    return this.paymentMethodRepository.save(method);
  }
}
