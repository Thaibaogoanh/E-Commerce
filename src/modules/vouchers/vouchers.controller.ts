import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UserVoucher } from '../../entities/user-voucher.entity';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('validate')
  async validateVoucher(
    @Query('code') code: string,
    @Query('orderAmount') orderAmount: number,
    @Request() req?: any,
  ): Promise<{
    valid: boolean;
    discount: number;
    message?: string;
  }> {
    const userId = req?.user?.id;
    const result = await this.vouchersService.validateVoucher(
      code,
      userId,
      orderAmount,
    );
    return {
      valid: result.valid,
      discount: result.discount,
      message: result.message,
    };
  }

  @Get('my-vouchers')
  @UseGuards(JwtAuthGuard)
  async getUserVouchers(@Request() req): Promise<UserVoucher[]> {
    return this.vouchersService.getUserVouchers(req.user.id);
  }
}

