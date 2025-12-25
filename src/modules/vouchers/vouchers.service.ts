import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Voucher,
  VoucherStatus,
  VoucherType,
} from '../../entities/voucher.entity';
import {
  UserVoucher,
  UserVoucherStatus,
} from '../../entities/user-voucher.entity';
import { RewardCatalog } from '../../entities/reward-catalog.entity';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);

  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectRepository(UserVoucher)
    private userVoucherRepository: Repository<UserVoucher>,
    @InjectRepository(RewardCatalog)
    private rewardCatalogRepository: Repository<RewardCatalog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async validateVoucher(
    code: string,
    userId: string | null,
    orderAmount: number,
  ): Promise<{
    valid: boolean;
    discount: number;
    voucher?: Voucher;
    message?: string;
  }> {
    try {
      // Normalize code
      const normalizedCode = code.toUpperCase().trim();
      if (!normalizedCode) {
        return {
          valid: false,
          discount: 0,
          message: 'Voucher code cannot be empty',
        };
      }

      // Find voucher
      const voucher = await this.voucherRepository.findOne({
        where: { code: normalizedCode },
      });

      if (!voucher) {
        return {
          valid: false,
          discount: 0,
          message: 'Voucher code not found',
        };
      }

      // Check voucher status
      if (voucher.status !== VoucherStatus.ACTIVE) {
        return {
          valid: false,
          discount: 0,
          message: `Voucher is ${voucher.status}`,
        };
      }

      // Check validity dates (with timezone consideration)
      const now = new Date();
      const validFrom = new Date(voucher.validFrom);
      const validUntil = new Date(voucher.validUntil);
      // Set time to end of day for validUntil
      validUntil.setHours(23, 59, 59, 999);

      if (now < validFrom) {
        return {
          valid: false,
          discount: 0,
          message: `Voucher is not yet valid. Valid from ${validFrom.toLocaleDateString('vi-VN')}`,
        };
      }

      if (now > validUntil) {
        // Auto-update status to expired
        voucher.status = VoucherStatus.EXPIRED;
        await this.voucherRepository.save(voucher);
        return {
          valid: false,
          discount: 0,
          message: 'Voucher has expired',
        };
      }

      // Check minimum order amount
      if (
        voucher.minOrderAmount &&
        orderAmount < Number(voucher.minOrderAmount)
      ) {
        return {
          valid: false,
          discount: 0,
          message: `Minimum order amount: ${Number(voucher.minOrderAmount).toLocaleString('vi-VN')}₫`,
        };
      }

      // Check max uses (global)
      if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
        return {
          valid: false,
          discount: 0,
          message: 'Voucher has reached maximum uses',
        };
      }

      // User eligibility checks (if userId provided)
      if (userId) {
        // Check user usage limit per user
        if (voucher.maxUsesPerUser) {
          const userUsage = await this.userVoucherRepository.count({
            where: {
              userId,
              voucherId: voucher.id,
              status: UserVoucherStatus.USED,
            },
          });
          if (userUsage >= voucher.maxUsesPerUser) {
            return {
              valid: false,
              discount: 0,
              message: `You have already used this voucher ${voucher.maxUsesPerUser} time(s)`,
            };
          }
        }

        // Check if user has already used this voucher in a pending order
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const pendingUsage = await this.userVoucherRepository.findOne({
          where: {
            userId,
            voucherId: voucher.id,
            status: UserVoucherStatus.AVAILABLE,
          },
          relations: ['order'],
        });

        // Additional user eligibility checks can be added here:
        // - Check if user is new (created within X days)
        // - Check if user has made X orders
        // - Check if user belongs to specific user group
        // Example:
        // const user = await this.userRepository.findOne({ where: { UserID: userId } });
        // if (voucher.onlyForNewUsers) {
        //   const daysSinceRegistration = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        //   if (daysSinceRegistration > 30) {
        //     return { valid: false, discount: 0, message: 'This voucher is only for new users' };
        //   }
        // }
      }

      // Calculate discount
      let discount = 0;
      if (voucher.type === VoucherType.PERCENTAGE) {
        discount = (orderAmount * Number(voucher.value)) / 100;
        // Cap discount at order amount
        if (discount > orderAmount) {
          discount = orderAmount;
        }
      } else if (voucher.type === VoucherType.FIXED_AMOUNT) {
        discount = Number(voucher.value);
        // Cap discount at order amount
        if (discount > orderAmount) {
          discount = orderAmount;
        }
      } else if (voucher.type === VoucherType.FREE_SHIPPING) {
        discount = 0; // Will be handled separately in order calculation
      }

      this.logger.log(
        `Voucher ${normalizedCode} validated successfully for user ${userId || 'anonymous'}. Discount: ${discount}₫`,
      );

      return {
        valid: true,
        discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
        voucher,
      };
    } catch (error) {
      this.logger.error(
        `Error validating voucher ${code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        valid: false,
        discount: 0,
        message: 'Error validating voucher. Please try again.',
      };
    }
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
    // Map RewardType to VoucherType
    let voucherType: VoucherType;
    if (reward.type === 'voucher') {
      voucherType = VoucherType.PERCENTAGE;
    } else if (reward.type === 'discount') {
      voucherType = VoucherType.PERCENTAGE;
    } else if (reward.type === 'free_shipping') {
      voucherType = VoucherType.FREE_SHIPPING;
    } else {
      voucherType = VoucherType.FIXED_AMOUNT;
    }

    const voucher = this.voucherRepository.create({
      code: `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: voucherType,
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
