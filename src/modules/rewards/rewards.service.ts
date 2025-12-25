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
import {
  CreateRewardCatalogDto,
  UpdateRewardCatalogDto,
} from '../../dto/reward.dto';

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
    userId: string;
    balance: number;
    tier: string;
    nextTierPoints: number;
    pointsUntilNextTier: number;
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

    const balance = total - redeemed - expired;

    // Tier thresholds
    const tiers = [
      { name: 'silver', threshold: 0 },
      { name: 'gold', threshold: 1000 },
      { name: 'platinum', threshold: 5000 },
      { name: 'diamond', threshold: 10000 },
    ];

    // Determine current tier
    let currentTier = 'silver';
    let nextTierPoints = 1000;

    for (const tier of tiers) {
      if (balance >= tier.threshold) {
        currentTier = tier.name;
        const nextTierIndex = tiers.indexOf(tier) + 1;
        if (nextTierIndex < tiers.length) {
          nextTierPoints = tiers[nextTierIndex].threshold;
        } else {
          // Already at highest tier
          nextTierPoints = tier.threshold;
        }
      }
    }

    const pointsUntilNextTier = Math.max(0, nextTierPoints - balance);

    return {
      userId,
      balance,
      tier: currentTier,
      nextTierPoints,
      pointsUntilNextTier,
    };
  }

  async getPointsHistory(
    userId: string,
    limit?: number,
  ): Promise<RewardPoint[]> {
    const queryBuilder = this.rewardPointRepository
      .createQueryBuilder('rewardPoint')
      .where('rewardPoint.userId = :userId', { userId })
      .orderBy('rewardPoint.createdAt', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }

    return queryBuilder.getMany();
  }

  async getRewardCatalog(): Promise<RewardCatalog[]> {
    return this.rewardCatalogRepository.find({
      where: { isActive: true },
      order: { pointsRequired: 'ASC' },
    });
  }

  async getRewardCatalogById(id: string): Promise<RewardCatalog> {
    const reward = await this.rewardCatalogRepository.findOne({
      where: { id },
    });
    if (!reward) {
      throw new NotFoundException('Reward catalog not found');
    }
    return reward;
  }

  async createRewardCatalog(
    createDto: CreateRewardCatalogDto,
  ): Promise<RewardCatalog> {
    const reward = this.rewardCatalogRepository.create({
      ...createDto,
      isActive: createDto.isActive !== undefined ? createDto.isActive : true,
    });
    return this.rewardCatalogRepository.save(reward);
  }

  async updateRewardCatalog(
    id: string,
    updateDto: UpdateRewardCatalogDto,
  ): Promise<RewardCatalog> {
    const reward = await this.rewardCatalogRepository.findOne({
      where: { id },
    });
    if (!reward) {
      throw new NotFoundException('Reward catalog not found');
    }

    Object.assign(reward, updateDto);
    return this.rewardCatalogRepository.save(reward);
  }

  async deleteRewardCatalog(id: string): Promise<void> {
    const reward = await this.rewardCatalogRepository.findOne({
      where: { id },
    });
    if (!reward) {
      throw new NotFoundException('Reward catalog not found');
    }

    await this.rewardCatalogRepository.remove(reward);
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

    const balanceData = await this.getPointsBalance(userId);
    if (balanceData.balance < reward.pointsRequired) {
      throw new BadRequestException('Insufficient points');
    }

    // Create voucher from reward
    const voucher = await this.vouchersService.createFromReward(userId, reward);

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
