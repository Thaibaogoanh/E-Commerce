import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { IPaymentGateway } from './payment-gateway.interface';

/**
 * VNPay Payment Gateway Implementation
 * 
 * Tài liệu: https://sandbox.vnpayment.vn/apis/
 * 
 * Để sử dụng:
 * 1. Đăng ký tài khoản tại https://sandbox.vnpayment.vn/
 * 2. Lấy TMN Code và Secret Key
 * 3. Thêm vào .env:
 *    VNPAY_TMN_CODE=your_tmn_code
 *    VNPAY_SECRET_KEY=your_secret_key
 *    VNPAY_RETURN_URL=http://localhost:3000/payment/callback
 *    VNPAY_CANCEL_URL=http://localhost:3000/payment/cancel
 *    VNPAY_API_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
 */
@Injectable()
export class VNPayGateway implements IPaymentGateway {
  private readonly logger = new Logger(VNPayGateway.name);
  private readonly tmnCode: string;
  private readonly secretKey: string;
  private readonly returnUrl: string;
  private readonly cancelUrl: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || '';
    this.secretKey = this.configService.get<string>('VNPAY_SECRET_KEY') || '';
    this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL') || '';
    this.cancelUrl = this.configService.get<string>('VNPAY_CANCEL_URL') || '';
    this.apiUrl = this.configService.get<string>(
      'VNPAY_API_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );

    if (!this.tmnCode || !this.secretKey) {
      this.logger.warn(
        'VNPay credentials not configured. Payment will fail. Please set VNPAY_TMN_CODE and VNPAY_SECRET_KEY in .env',
      );
    }
  }

  async initiatePayment(params: {
    amount: number;
    orderId: string;
    description: string;
    returnUrl?: string;
    cancelUrl?: string;
    [key: string]: any;
  }): Promise<{ paymentUrl: string; transactionId: string }> {
    if (!this.tmnCode || !this.secretKey) {
      throw new Error('VNPay credentials not configured');
    }

    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(
      new Date(date.getTime() + 15 * 60 * 1000),
    ); // 15 phút

    // VNPay giới hạn orderId 34 ký tự
    const orderId = params.orderId.substring(0, 34);
    // VNPay yêu cầu số nguyên (tính bằng xu)
    const amount = Math.round(params.amount);

    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: amount * 100, // VNPay tính bằng xu (1 VND = 100 xu)
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: params.description.substring(0, 255),
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: params.returnUrl || this.returnUrl,
      vnp_IpAddr: '127.0.0.1', // TODO: Lấy IP thực từ request
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sắp xếp params và tạo secure hash
    vnp_Params['vnp_SecureHash'] = this.createSecureHash(vnp_Params);

    const paymentUrl = `${this.apiUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;

    this.logger.log(`VNPay payment initiated for order: ${orderId}, amount: ${amount} VND`);

    return {
      paymentUrl,
      transactionId: orderId,
    };
  }

  async verifyPayment(params: {
    transactionId: string;
    amount: number;
    vnp_SecureHash?: string;
    vnp_ResponseCode?: string;
    [key: string]: any;
  }): Promise<{
    success: boolean;
    transactionId: string;
    amount: number;
    message?: string;
  }> {
    if (!this.secretKey) {
      throw new Error('VNPay secret key not configured');
    }

    const { vnp_SecureHash, vnp_ResponseCode, ...otherParams } = params;

    // Verify signature
    const secureHash = this.createSecureHash(otherParams);
    if (secureHash !== vnp_SecureHash) {
      this.logger.error(
        `VNPay signature verification failed for transaction: ${params.transactionId}`,
      );
      return {
        success: false,
        transactionId: params.transactionId,
        amount: params.amount / 100, // Convert từ xu về VND
        message: 'Invalid signature',
      };
    }

    // Kiểm tra response code từ VNPay
    // 00 = Thành công
    if (vnp_ResponseCode === '00') {
      this.logger.log(
        `VNPay payment verified successfully for transaction: ${params.transactionId}`,
      );
      return {
        success: true,
        transactionId: params.transactionId,
        amount: params.amount / 100, // Convert từ xu về VND
        message: 'Payment successful',
      };
    }

    // Các mã lỗi khác
    const errorMessages: { [key: string]: string } = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản bị khóa.',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Quá 3 lần.',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch cho phép.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
    };

    const errorMessage =
      errorMessages[vnp_ResponseCode || ''] ||
      `Payment failed with code: ${vnp_ResponseCode}`;

    this.logger.warn(
      `VNPay payment failed for transaction: ${params.transactionId}, code: ${vnp_ResponseCode}`,
    );

    return {
      success: false,
      transactionId: params.transactionId,
      amount: params.amount / 100,
      message: errorMessage,
    };
  }

  /**
   * Tạo secure hash theo chuẩn VNPay
   */
  private createSecureHash(params: any): string {
    // Loại bỏ các field không cần thiết
    const filteredParams = Object.keys(params)
      .filter(
        (key) =>
          key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType' && params[key] !== '',
      )
      .sort()
      .reduce((result: any, key) => {
        result[key] = params[key];
        return result;
      }, {});

    // Tạo query string
    const signData = querystring.stringify(filteredParams, { encode: false });

    // Tạo HMAC SHA512
    const hmac = crypto.createHmac('sha512', this.secretKey);
    return hmac.update(signData, 'utf-8').digest('hex');
  }

  /**
   * Format date theo chuẩn VNPay: yyyyMMddHHmmss
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

