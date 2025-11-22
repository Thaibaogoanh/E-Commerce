import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Voucher, VoucherStatus, VoucherType } from '../../entities/voucher.entity';
import { UserVoucher, UserVoucherStatus } from '../../entities/user-voucher.entity';
import { RewardCatalog } from '../../entities/reward-catalog.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectRepository(UserVoucher)
    private userVoucherRepository: Repository<UserVoucher>,
    @InjectRepository(RewardCatalog)
    private rewardCatalogRepository: Repository<RewardCatalog>,
  ) {}

  async validateVoucher(
    code: string,
    userId: string,
    orderAmount: number,
  ): Promise<{
    valid: boolean;
    discount: number;
    voucher?: Voucher;
    message?: string;
  }> {
    const voucher = await this.voucherRepository.findOne({
      where: { code: code.toUpperCase(), status: VoucherStatus.ACTIVE },
    });

    if (!voucher) {
      return {
        valid: false,
        discount: 0,
        message: 'Voucher code not found',
      };
    }

    // Check validity dates
    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validUntil) {
      return {
        valid: false,
        discount: 0,
        message: 'Voucher has expired',
      };
    }

    // Check minimum order amount
    if (voucher.minOrderAmount && orderAmount < voucher.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount: ${voucher.minOrderAmount.toLocaleString('vi-VN')}₫`,
      };
    }

    // Check max uses
    if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
      return {
        valid: false,
        discount: 0,
        message: 'Voucher has reached maximum uses',
      };
    }

    // Check user usage limit
    if (voucher.maxUsesPerUser) {
      const userUsage = await this.userVoucherRepository.count({
        where: { userId, voucherId: voucher.id, status: UserVoucherStatus.USED },
      });
      if (userUsage >= voucher.maxUsesPerUser) {
        return {
          valid: false,
          discount: 0,
          message: 'You have already used this voucher maximum times',
        };
      }
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === 'percentage') {
      discount = (orderAmount * voucher.value) / 100;
    } else if (voucher.type === 'fixed_amount') {
      discount = voucher.value;
    } else if (voucher.type === 'free_shipping') {
      discount = 0; // Will be handled separately
    }

    return {
      valid: true,
      discount,
      voucher,
    };
  }

  async getUserVouchers(userId: string): Promise<UserVoucher[]> {
    return this.userVoucherRepository.find({
      where: { userId },
      relations: ['voucher'],
      order: { createdAt: 'DESC' },
    });
  }

  async createFromReward(
    userId: string,
    reward: RewardCatalog,
  ): Promise<Voucher> {
    // Create a voucher from reward catalog
    const voucher = this.voucherRepository.create({
      code: `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: reward.type as VoucherType,
      value: reward.discountValue || 0,
      minOrderAmount: reward.minOrderAmount,
      maxUses: 1, // One-time use
      maxUsesPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      status: VoucherStatus.ACTIVE,
      pointsRequired: reward.pointsRequired,
      description: reward.description,
    });

    const savedVoucher = await this.voucherRepository.save(voucher);

    // Create user voucher record
    const userVoucher = this.userVoucherRepository.create({
      userId,
      voucherId: savedVoucher.id,
      status: UserVoucherStatus.AVAILABLE,
    });

    await this.userVoucherRepository.save(userVoucher);

    return savedVoucher;
  }

  async useVoucher(
    userId: string,
    voucherId: string,
    orderId: string,
  ): Promise<void> {
    const userVoucher = await this.userVoucherRepository.findOne({
      where: {
        userId,
        voucherId,
        status: UserVoucherStatus.AVAILABLE,
      },
      relations: ['voucher'],
    });

    if (!userVoucher) {
      throw new NotFoundException('Voucher not found or already used');
    }

    userVoucher.status = UserVoucherStatus.USED;
    userVoucher.orderId = orderId;
    userVoucher.usedAt = new Date();

    await this.userVoucherRepository.save(userVoucher);

    // Update voucher used count
    const voucher = userVoucher.voucher;
    voucher.usedCount += 1;
    await this.voucherRepository.save(voucher);
  }
}

