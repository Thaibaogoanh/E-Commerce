import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { PaymentMethod } from '../../entities/payment-method.entity';
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
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    private vnpayGateway: VNPayGateway,
    private configService: ConfigService,
  ) { }

  /**
   * Initialize payment
   * Tích hợp với VNPay Gateway
   */
  async initiatePayment(request: PaymentInitRequest): Promise<PaymentResponse> {
    try {
      // Validate amount
      if (!request.amount || request.amount <= 0) {
        throw new BadRequestException('Invalid payment amount');
      }

      // Validate orderId
      if (!request.orderId || request.orderId.trim() === '') {
        throw new BadRequestException('Order ID is required');
      }

      let paymentMethodId = request.paymentMethodId;

      // Nếu paymentMethodId không phải UUID, tìm theo tên (e.g., 'vnpay', 'momo')
      if (!paymentMethodId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const paymentMethod = await this.paymentMethodRepository.findOne({
          where: { MethodName: request.paymentMethodId },
        });
        if (!paymentMethod) {
          throw new BadRequestException(`Payment method '${request.paymentMethodId}' not found`);
        }
        paymentMethodId = paymentMethod.MethodID;
      }

      // Tạo payment record
      const payment = this.paymentRepository.create({
        paymentMethodId,
        orderId: request.orderId,
        amount: request.amount,
        payment_status: PaymentStatus.PENDING,
        txn_ref: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Lấy frontend URL từ config
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

      // Tạo description an toàn cho VNPay (chỉ dùng alphanumeric)
      const safeDescription = `Payment for order ${request.orderId.replace(/-/g, '').substring(0, 20)}`;

      // Gọi VNPay gateway để lấy payment URL
      try {
        const gatewayResult = await this.vnpayGateway.initiatePayment({
          amount: request.amount,
          orderId: savedPayment.PaymentID,
          description: safeDescription,
          returnUrl: `${frontendUrl}/payment/callback?paymentId=${savedPayment.PaymentID}`,
          // cancelUrl: `${frontendUrl}/payment/cancel?paymentId=${savedPayment.PaymentID}`,
        });

        // Lưu transaction ID từ gateway
        savedPayment.txn_ref = gatewayResult.transactionId;
        await this.paymentRepository.save(savedPayment);

        this.logger.log(
          `[PaymentService] Payment initiated: ${savedPayment.PaymentID} for order ${request.orderId}, txnRef: ${gatewayResult.transactionId}`,
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
      if (error instanceof BadRequestException) {
        throw error;
      }
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
      this.logger.log(`[PaymentService] Processing VNPay callback for payment: ${paymentId}`);
      this.logger.debug(`[PaymentService] Callback params: ${JSON.stringify(callbackParams)}`);

      const payment = await this.paymentRepository.findOne({
        where: { PaymentID: paymentId },
      });

      if (!payment) {
        this.logger.error(`[PaymentService] Payment not found: ${paymentId}`);
        throw new BadRequestException('Payment not found');
      }

      // Parse amount từ callback (VNPay trả về string)
      const vnpAmount = callbackParams.vnp_Amount
        ? parseInt(String(callbackParams.vnp_Amount), 10)
        : payment.amount * 100;

      // Verify payment với VNPay gateway
      // QUAN TRỌNG: Phải truyền TẤT CẢ params từ callback VNPay
      // vì signature được tạo từ tất cả params vnp_* (trừ vnp_SecureHash, vnp_SecureHashType)
      const verifyResult = await this.vnpayGateway.verifyPayment({
        ...callbackParams, // Truyền tất cả params từ VNPay callback
        transactionId: callbackParams.vnp_TxnRef || payment.txn_ref || paymentId,
        amount: vnpAmount, // Giữ lại để compatible với interface
      });

      if (verifyResult.success) {
        payment.payment_status = PaymentStatus.COMPLETED;
        payment.paid_at = new Date();
        // Lưu transaction number từ VNPay (nếu có)
        if (callbackParams.vnp_TransactionNo) {
          payment.txn_ref = callbackParams.vnp_TransactionNo;
        }
        await this.paymentRepository.save(payment);

        this.logger.log(
          `[PaymentService] VNPay payment verified successfully: ${paymentId}, txnNo: ${callbackParams.vnp_TransactionNo}`,
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