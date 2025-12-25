import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { RewardPoint } from '../../entities/reward-point.entity';
import { RewardCatalog } from '../../entities/reward-catalog.entity';
import {
  CreateRewardCatalogDto,
  UpdateRewardCatalogDto,
} from '../../dto/reward.dto';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('points')
  async getPointsBalance(
    @Request() req,
  ): Promise<{
    userId: string;
    balance: number;
    tier: string;
    nextTierPoints: number;
    pointsUntilNextTier: number;
  }> {
    return this.rewardsService.getPointsBalance(req.user.id);
  }

  @Get('history')
  async getPointsHistory(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<RewardPoint[]> {
    return this.rewardsService.getPointsHistory(
      req.user.id,
      limit ? parseInt(limit.toString()) : undefined,
    );
  }

  @Get('catalog')
  async getRewardCatalog(): Promise<RewardCatalog[]> {
    return this.rewardsService.getRewardCatalog();
  }

  @Post('catalog')
  @UseGuards(AdminGuard)
  async createRewardCatalog(
    @Body() createDto: CreateRewardCatalogDto,
  ): Promise<RewardCatalog> {
    return this.rewardsService.createRewardCatalog(createDto);
  }

  @Get('catalog/:id')
  @UseGuards(AdminGuard)
  async getRewardCatalogById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RewardCatalog> {
    return this.rewardsService.getRewardCatalogById(id);
  }

  @Patch('catalog/:id')
  @UseGuards(AdminGuard)
  async updateRewardCatalog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRewardCatalogDto,
  ): Promise<RewardCatalog> {
    return this.rewardsService.updateRewardCatalog(id, updateDto);
  }

  @Delete('catalog/:id')
  @UseGuards(AdminGuard)
  async deleteRewardCatalog(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.rewardsService.deleteRewardCatalog(id);
    return { message: 'Reward catalog deleted successfully' };
  }

  @Post('redeem/:rewardId')
  async redeemPoints(
    @Request() req,
    @Param('rewardId', ParseUUIDPipe) rewardId: string,
  ): Promise<{ voucher: any; pointsUsed: number }> {
    return this.rewardsService.redeemPoints(req.user.id, rewardId);
  }
}
