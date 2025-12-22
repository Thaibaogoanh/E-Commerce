import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { VNPayGateway } from './gateways/vnpay.gateway';

export interface PaymentInitRequest {
  orderId: string;
  amount: number;
  paymentMethodId: string;
  description: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  paymentUrl?: string;
  message: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private vnpayGateway: VNPayGateway,
    private configService: ConfigService,
  ) {}

  /**
   * Initialize payment
   * Tích hợp với VNPay Gateway
   */
  async initiatePayment(request: PaymentInitRequest): Promise<PaymentResponse> {
    try {
      // Tạo payment record
      const payment = this.paymentRepository.create({
        paymentMethodId: request.paymentMethodId,
        orderId: request.orderId,
        amount: request.amount,
        payment_status: PaymentStatus.PENDING,
        txn_ref: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Lấy frontend URL từ config
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

      // Gọi VNPay gateway để lấy payment URL
      try {
        const gatewayResult = await this.vnpayGateway.initiatePayment({
          amount: request.amount,
          orderId: savedPayment.PaymentID,
          description: request.description,
          returnUrl: `${frontendUrl}/payment/callback?paymentId=${savedPayment.PaymentID}`,
          cancelUrl: `${frontendUrl}/payment/cancel?paymentId=${savedPayment.PaymentID}`,
        });

        // Lưu transaction ID
        savedPayment.txn_ref = gatewayResult.transactionId;
        await this.paymentRepository.save(savedPayment);

        this.logger.log(
          `[PaymentService] Payment initiated: ${savedPayment.PaymentID} for order ${request.orderId}`,
        );

        return {
          id: savedPayment.PaymentID,
          orderId: request.orderId,
          status: 'pending',
          amount: request.amount,
          paymentUrl: gatewayResult.paymentUrl,
          message: 'Redirecting to payment gateway...',
        };
      } catch (gatewayError: any) {
        // Nếu gateway không được config, fallback về mock mode
        this.logger.warn(
          `[PaymentService] Gateway not configured, using mock mode: ${gatewayError.message}`,
        );
        return {
          id: savedPayment.PaymentID,
          orderId: request.orderId,
          status: 'pending',
          amount: request.amount,
          message: 'Payment initialized (mock mode). Please configure VNPay credentials.',
        };
      }
    } catch (error: any) {
      this.logger.error(
        `[PaymentService] Error initiating payment: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to initiate payment');
    }
  }

  /**
   * Verify payment callback from payment gateway (Legacy method - for backward compatibility)
   */
  async verifyPayment(paymentId: string, transactionId: string): Promise<PaymentResponse> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { PaymentID: paymentId },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      if (transactionId && transactionId.length > 0) {
        payment.payment_status = PaymentStatus.COMPLETED;
        payment.txn_ref = transactionId;
        await this.paymentRepository.save(payment);
        this.logger.log(`[PaymentService] Payment verified: ${paymentId}`);

        return {
          id: payment.PaymentID,
          orderId: payment.orderId,
          status: 'completed',
          amount: payment.amount,
          message: 'Payment completed successfully',
        };
      }

      throw new BadRequestException('Invalid transaction');
    } catch (error: any) {
      this.logger.error(
        `[PaymentService] Error verifying payment: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException('Payment verification failed');
    }
  }

  /**
   * Handle payment callback from VNPay
   * @param paymentId Payment ID
   * @param callbackParams Callback parameters from VNPay
   */
  async handleVNPayCallback(
    paymentId: string,
    callbackParams: any,
  ): Promise<PaymentResponse> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { PaymentID: paymentId },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // Verify payment với VNPay gateway
      const verifyResult = await this.vnpayGateway.verifyPayment({
        transactionId: callbackParams.vnp_TxnRef || paymentId,
        amount: callbackParams.vnp_Amount || payment.amount * 100,
        ...callbackParams,
      });

      if (verifyResult.success) {
        payment.payment_status = PaymentStatus.COMPLETED;
        payment.paid_at = new Date();
        payment.txn_ref = callbackParams.vnp_TransactionNo || callbackParams.vnp_TxnRef;
        await this.paymentRepository.save(payment);

        this.logger.log(
          `[PaymentService] VNPay payment verified successfully: ${paymentId}`,
        );

        // TODO: Update order status to 'paid' or 'processing'
        // TODO: Send confirmation email

        return {
          id: payment.PaymentID,
          orderId: payment.orderId,
          status: 'completed',
          amount: payment.amount,
          message: verifyResult.message || 'Payment completed successfully',
        };
      } else {
        payment.payment_status = PaymentStatus.FAILED;
        await this.paymentRepository.save(payment);

        this.logger.warn(
          `[PaymentService] VNPay payment verification failed: ${paymentId}, reason: ${verifyResult.message}`,
        );

        return {
          id: payment.PaymentID,
          orderId: payment.orderId,
          status: 'failed',
          amount: payment.amount,
          message: verifyResult.message || 'Payment verification failed',
        };
      }
    } catch (error: any) {
      this.logger.error(
        `[PaymentService] Error handling VNPay callback: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException('Payment callback processing failed');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findOne({
      where: { PaymentID: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      id: payment.PaymentID,
      orderId: payment.orderId,
      status: payment.payment_status as any,
      amount: payment.amount,
      message: `Payment status: ${payment.payment_status}`,
    };
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findOne({
      where: { PaymentID: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.payment_status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending payments');
    }

    payment.payment_status = PaymentStatus.FAILED;
    await this.paymentRepository.save(payment);

    this.logger.log(`[PaymentService] Payment cancelled: ${paymentId}`);

    return {
      id: payment.PaymentID,
      orderId: payment.orderId,
      status: 'failed',
      amount: payment.amount,
      message: 'Payment cancelled',
    };
  }

}