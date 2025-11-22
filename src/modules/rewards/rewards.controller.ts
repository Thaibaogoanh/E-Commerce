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
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RewardPoint } from '../../entities/reward-point.entity';
import { RewardCatalog } from '../../entities/reward-catalog.entity';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('points')
  async getPointsBalance(@Request() req): Promise<{
    total: number;
    available: number;
    pending: number;
    expired: number;
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

  @Post('redeem/:rewardId')
  async redeemPoints(
    @Request() req,
    @Param('rewardId', ParseUUIDPipe) rewardId: string,
  ): Promise<{ voucher: any; pointsUsed: number }> {
    return this.rewardsService.redeemPoints(req.user.id, rewardId);
  }
}

