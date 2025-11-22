import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RewardPoint,
  PointType,
  PointSource,
} from '../../entities/reward-point.entity';
import { RewardCatalog } from '../../entities/reward-catalog.entity';
import { User } from '../../entities/user.entity';
import { Voucher } from '../../entities/voucher.entity';
import { VouchersService } from '../vouchers/vouchers.service';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(RewardPoint)
    private rewardPointRepository: Repository<RewardPoint>,
    @InjectRepository(RewardCatalog)
    private rewardCatalogRepository: Repository<RewardCatalog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private vouchersService: VouchersService,
  ) {}

  async getPointsBalance(userId: string): Promise<{
    total: number;
    available: number;
    pending: number;
    expired: number;
  }> {
    const points = await this.rewardPointRepository.find({
      where: { userId },
    });

    const total = points
      .filter((p) => p.type === PointType.EARNED)
      .reduce((sum, p) => sum + p.points, 0);

    const redeemed = points
      .filter((p) => p.type === PointType.REDEEMED)
      .reduce((sum, p) => sum + Math.abs(p.points), 0);

    const expired = points
      .filter((p) => p.type === PointType.EXPIRED)
      .reduce((sum, p) => sum + Math.abs(p.points), 0);

    const available = total - redeemed - expired;

    return {
      total,
      available,
      pending: 0, // Could calculate pending points from pending orders
      expired,
    };
  }

  async getPointsHistory(
    userId: string,
    limit?: number,
  ): Promise<RewardPoint[]> {
    const query = this.rewardPointRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (limit) {
      query.take(limit);
    }

    return query;
  }

  async getRewardCatalog(): Promise<RewardCatalog[]> {
    return this.rewardCatalogRepository.find({
      where: { isActive: true },
      order: { pointsRequired: 'ASC' },
    });
  }

  async redeemPoints(
    userId: string,
    rewardId: string,
  ): Promise<{ voucher: Voucher; pointsUsed: number }> {
    const user = await this.userRepository.findOne({
      where: { UserID: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reward = await this.rewardCatalogRepository.findOne({
      where: { id: rewardId, isActive: true },
    });
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    const balance = await this.getPointsBalance(userId);
    if (balance.available < reward.pointsRequired) {
      throw new BadRequestException('Insufficient points');
    }

    // Create voucher from reward
    const voucher = await this.vouchersService.createFromReward(
      userId,
      reward,
    );

    // Record points redemption
    const redemption = this.rewardPointRepository.create({
      userId,
      type: PointType.REDEEMED,
      source: PointSource.VOUCHER_REDEMPTION,
      points: -reward.pointsRequired,
      description: `Redeemed for ${reward.name}`,
    });

    await this.rewardPointRepository.save(redemption);

    return { voucher, pointsUsed: reward.pointsRequired };
  }

  async addPoints(
    userId: string,
    points: number,
    source: PointSource,
    orderId?: string,
    description?: string,
  ): Promise<RewardPoint> {
    const point = this.rewardPointRepository.create({
      userId,
      orderId,
      type: PointType.EARNED,
      source,
      points,
      description,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    return this.rewardPointRepository.save(point);
  }
}

