import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @Request() req,
    @Body()
    paymentData: {
      orderId: string;
      amount: number;
      paymentMethodId: string;
      description: string;
    },
  ) {
    return this.paymentService.initiatePayment(paymentData);
  }

  /**
   * VNPay Callback Endpoint
   * VNPay sẽ gọi endpoint này sau khi user thanh toán
   * Không cần JWT guard vì đây là callback từ external service
   */
  @Get('callback/vnpay')
  async vnpayCallback(
    @Query('paymentId') paymentId: string,
    @Query() queryParams: any, // VNPay sẽ gửi các params về đây
  ) {
    return this.paymentService.handleVNPayCallback(paymentId, queryParams);
  }

  @Post(':paymentId/verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() body: { transactionId: string },
  ) {
    return this.paymentService.verifyPayment(paymentId, body.transactionId);
  }

  @Get(':paymentId/status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.paymentService.getPaymentStatus(paymentId);
  }

  @Post(':paymentId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelPayment(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.paymentService.cancelPayment(paymentId);
  }
}
