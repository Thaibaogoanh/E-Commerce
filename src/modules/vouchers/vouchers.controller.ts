import {
  Controller,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UserVoucher } from '../../entities/user-voucher.entity';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate voucher code',
    description: 'Validates a voucher code and returns discount amount if valid',
  })
  @ApiQuery({
    name: 'code',
    type: String,
    description: 'Voucher code to validate',
    example: 'SAVE10',
  })
  @ApiQuery({
    name: 'orderAmount',
    type: Number,
    description: 'Order amount to validate against minimum order requirement',
    example: 500000,
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        discount: { type: 'number' },
        message: { type: 'string', nullable: true },
      },
    },
  })
  async validateVoucher(
    @Query('code') code: string,
    @Query('orderAmount') orderAmount: number,
    @Request() req,
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
