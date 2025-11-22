import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../entities/address.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(userId: string): Promise<Address[]> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.addressRepository.find({
      where: { userId },
      order: { is_default: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { addr_id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async create(userId: string, addressData: Partial<Address>): Promise<Address> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If this is set as default, unset other defaults
    if (addressData.is_default) {
      await this.addressRepository.update(
        { userId, is_default: true },
        { is_default: false },
      );
    }

    const address = this.addressRepository.create({
      ...addressData,
      userId,
    });

    return this.addressRepository.save(address);
  }

  async update(
    userId: string,
    addressId: string,
    updateData: Partial<Address>,
  ): Promise<Address> {
    const address = await this.findOne(userId, addressId);

    // If setting as default, unset other defaults
    if (updateData.is_default && !address.is_default) {
      await this.addressRepository.update(
        { userId, is_default: true },
        { is_default: false },
      );
    }

    Object.assign(address, updateData);
    return this.addressRepository.save(address);
  }

  async remove(userId: string, addressId: string): Promise<void> {
    const address = await this.findOne(userId, addressId);
    await this.addressRepository.remove(address);
  }

  async setDefault(userId: string, addressId: string): Promise<Address> {
    const address = await this.findOne(userId, addressId);

    // Unset all other defaults
    await this.addressRepository.update(
      { userId, is_default: true },
      { is_default: false },
    );

    // Set this as default
    address.is_default = true;
    return this.addressRepository.save(address);
  }
}

