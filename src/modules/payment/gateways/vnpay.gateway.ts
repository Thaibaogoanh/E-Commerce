import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IPaymentGateway } from './payment-gateway.interface';
import * as qs from 'qs';
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

  /**
   * Sanitize text cho VNPay - loại bỏ ký tự đặc biệt, chỉ giữ alphanumeric và khoảng trắng
   */
  private sanitizeOrderInfo(text: string): string {
    // Chuyển tiếng Việt thành không dấu
    const vietnameseMap: { [key: string]: string } = {
      à: 'a',
      á: 'a',
      ạ: 'a',
      ả: 'a',
      ã: 'a',
      â: 'a',
      ầ: 'a',
      ấ: 'a',
      ậ: 'a',
      ẩ: 'a',
      ẫ: 'a',
      ă: 'a',
      ằ: 'a',
      ắ: 'a',
      ặ: 'a',
      ẳ: 'a',
      ẵ: 'a',
      è: 'e',
      é: 'e',
      ẹ: 'e',
      ẻ: 'e',
      ẽ: 'e',
      ê: 'e',
      ề: 'e',
      ế: 'e',
      ệ: 'e',
      ể: 'e',
      ễ: 'e',
      ì: 'i',
      í: 'i',
      ị: 'i',
      ỉ: 'i',
      ĩ: 'i',
      ò: 'o',
      ó: 'o',
      ọ: 'o',
      ỏ: 'o',
      õ: 'o',
      ô: 'o',
      ồ: 'o',
      ố: 'o',
      ộ: 'o',
      ổ: 'o',
      ỗ: 'o',
      ơ: 'o',
      ờ: 'o',
      ớ: 'o',
      ợ: 'o',
      ở: 'o',
      ỡ: 'o',
      ù: 'u',
      ú: 'u',
      ụ: 'u',
      ủ: 'u',
      ũ: 'u',
      ư: 'u',
      ừ: 'u',
      ứ: 'u',
      ự: 'u',
      ử: 'u',
      ữ: 'u',
      ỳ: 'y',
      ý: 'y',
      ỵ: 'y',
      ỷ: 'y',
      ỹ: 'y',
      đ: 'd',
      À: 'A',
      Á: 'A',
      Ạ: 'A',
      Ả: 'A',
      Ã: 'A',
      Â: 'A',
      Ầ: 'A',
      Ấ: 'A',
      Ậ: 'A',
      Ẩ: 'A',
      Ẫ: 'A',
      Ă: 'A',
      Ằ: 'A',
      Ắ: 'A',
      Ặ: 'A',
      Ẳ: 'A',
      Ẵ: 'A',
      È: 'E',
      É: 'E',
      Ẹ: 'E',
      Ẻ: 'E',
      Ẽ: 'E',
      Ê: 'E',
      Ề: 'E',
      Ế: 'E',
      Ệ: 'E',
      Ể: 'E',
      Ễ: 'E',
      Ì: 'I',
      Í: 'I',
      Ị: 'I',
      Ỉ: 'I',
      Ĩ: 'I',
      Ò: 'O',
      Ó: 'O',
      Ọ: 'O',
      Ỏ: 'O',
      Õ: 'O',
      Ô: 'O',
      Ồ: 'O',
      Ố: 'O',
      Ộ: 'O',
      Ổ: 'O',
      Ỗ: 'O',
      Ơ: 'O',
      Ờ: 'O',
      Ớ: 'O',
      Ợ: 'O',
      Ở: 'O',
      Ỡ: 'O',
      Ù: 'U',
      Ú: 'U',
      Ụ: 'U',
      Ủ: 'U',
      Ũ: 'U',
      Ư: 'U',
      Ừ: 'U',
      Ứ: 'U',
      Ự: 'U',
      Ử: 'U',
      Ữ: 'U',
      Ỳ: 'Y',
      Ý: 'Y',
      Ỵ: 'Y',
      Ỷ: 'Y',
      Ỹ: 'Y',
      Đ: 'D',
    };

    let result = text;
    for (const [viet, ascii] of Object.entries(vietnameseMap)) {
      result = result.split(viet).join(ascii);
    }

    // Chỉ giữ alphanumeric, space và một số ký tự an toàn
    return result.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 255);
  }

  /**
   * Tạo transaction reference hợp lệ cho VNPay
   * VNPay yêu cầu: alphanumeric, tối đa 34 ký tự, không trùng trong ngày
   */
  private generateTxnRef(orderId: string): string {
    // Loại bỏ dấu gạch ngang từ UUID và lấy 20 ký tự đầu
    const cleanId = orderId.replace(/-/g, '').substring(0, 20);
    // Thêm timestamp để đảm bảo unique trong ngày
    const timestamp = Date.now().toString().slice(-8);
    return `${cleanId}${timestamp}`;
  }

  initiatePayment(params: {
    amount: number;
    orderId: string;
    description: string;
    returnUrl?: string;
  }): Promise<{ paymentUrl: string; transactionId: string }> {
    const date = new Date();
    const createDate = this.formatDate(date);
    const txnRef = this.generateTxnRef(params.orderId);

    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: Math.round(params.amount) * 100,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: this.sanitizeOrderInfo(params.description),
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: params.returnUrl || this.returnUrl,
      vnp_IpAddr: '113.160.92.1', // Dùng IP thực hoặc IP tĩnh VN
      vnp_CreateDate: createDate,
    };

    // 1. Sắp xếp params
    const sortedParams = this.sortObject(vnp_Params);

    // 2. Tạo chuỗi query chuẩn để băm (SỬ DỤNG URLSearchParams)
    const signData = new URLSearchParams(sortedParams).toString();

    // 3. Tạo Secure Hash
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const secureHash = hmac
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    // 4. Tạo URL thanh toán cuối cùng
    const finalUrl = new URLSearchParams(sortedParams);
    finalUrl.append('vnp_SecureHash', secureHash);

    const paymentUrl = `${this.apiUrl}?${finalUrl.toString()}`;

    this.logger.debug(`VNPay SignData: ${signData}`);
    this.logger.debug(`VNPay URL: ${paymentUrl}`);

    return Promise.resolve({ paymentUrl, transactionId: txnRef });
  }

  /**
   * Build payment URL với params được encode đúng cách theo chuẩn VNPay
   */

  private buildPaymentUrl(
    sortedParams: { [key: string]: string },
    secureHash: string,
  ): string {
    const params = {
      ...sortedParams,
      vnp_SecureHash: secureHash,
    };

    // Phải dùng cùng một chuẩn encode (RFC1738) để tạo query string cuối cùng
    const queryString = qs.stringify(params, { encode: true });
    return `${this.apiUrl}?${queryString}`;
  }

  verifyPayment(params: {
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

    const {
      vnp_SecureHash,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      vnp_SecureHashType,
      vnp_ResponseCode,
      ...otherParams
    } = params;

    // Decode các giá trị nếu cần (VNPay callback có thể trả về URL-encoded values)
    const decodedParams: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(otherParams)) {
      if (typeof value === 'string') {
        try {
          // Decode URL-encoded values
          decodedParams[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        } catch {
          decodedParams[key] = value;
        }
      } else {
        decodedParams[key] = value;
      }
    }

    // Verify signature (so sánh không phân biệt chữ hoa/thường)
    const sortedParams = this.sortObject(decodedParams);
    const calculatedHash = this.createSecureHash(sortedParams);
    const receivedHash = vnp_SecureHash?.toLowerCase() || '';
    const expectedHash = calculatedHash.toLowerCase();

    this.logger.debug(`VNPay verify - Calculated hash: ${expectedHash}`);
    this.logger.debug(`VNPay verify - Received hash: ${receivedHash}`);

    if (expectedHash !== receivedHash) {
      this.logger.error(
        `VNPay signature verification failed for transaction: ${params.transactionId}`,
      );
      return Promise.resolve({
        success: false,
        transactionId: params.transactionId,
        amount: params.amount / 100, // Convert từ xu về VND
        message: 'Invalid signature',
      });
    }

    // Kiểm tra response code từ VNPay
    // 00 = Thành công
    if (vnp_ResponseCode === '00') {
      this.logger.log(
        `VNPay payment verified successfully for transaction: ${params.transactionId}`,
      );
      return Promise.resolve({
        success: true,
        transactionId: params.transactionId,
        amount: params.amount / 100, // Convert từ xu về VND
        message: 'Payment successful',
      });
    }

    // Các mã lỗi khác
    const errorMessages: { [key: string]: string } = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản bị khóa.',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Quá 3 lần.',
      '24': 'Khách hàng hủy giao dịch.',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch cho phép.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Lỗi không xác định.',
    };

    const errorMessage =
      errorMessages[vnp_ResponseCode || ''] ||
      `Payment failed with code: ${vnp_ResponseCode}`;

    this.logger.warn(
      `VNPay payment failed for transaction: ${params.transactionId}, code: ${vnp_ResponseCode}`,
    );

    return Promise.resolve({
      success: false,
      transactionId: params.transactionId,
      amount: params.amount / 100,
      message: errorMessage,
    });
  }

  /**
   * Sort object theo alphabet (giống VNPay demo)
   */
  private sortObject(obj: any) {
    const sorted = {};
    const keys = Object.keys(obj)
      .filter(
        (key) => key.startsWith('vnp_') && obj[key] !== '' && obj[key] !== null,
      )
      .sort();

    for (const key of keys) {
      sorted[key] = obj[key].toString();
    }
    return sorted;
  }
  /**
   * Tạo secure hash theo chuẩn VNPay (giống official demo)
   * Tạo chuỗi KHÔNG encode - theo đúng chuẩn VNPay v2.1.0
   */
  private createSecureHash(sortedParams: { [key: string]: string }): string {
    // Tự nối chuỗi, TUYỆT ĐỐI KHÔNG dùng thư viện encode ở bước này
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${sortedParams[key]}`)
      .join('&');

    this.logger.debug(`VNPay signData (MANUAL RAW): ${signData}`);

    const hmac = crypto.createHmac('sha512', this.secretKey);
    return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  }
  /**
   * Format date theo chuẩn VNPay: yyyyMMddHHmmss
   * Sử dụng local time của server (phải đảm bảo server ở UTC+7 hoặc timezone Vietnam)
   */
  private formatDate(date: Date): string {
    // Sử dụng local time trực tiếp (server nên cấu hình timezone Vietnam)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}
