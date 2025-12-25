/**
 * Payment Gateway Interface
 *
 * Tất cả payment gateway implementations phải implement interface này
 * để đảm bảo tính nhất quán và dễ dàng thêm gateway mới
 */
export interface IPaymentGateway {
  /**
   * Khởi tạo payment với gateway
   * @param params Payment parameters
   * @returns Payment URL và transaction ID
   */
  initiatePayment(params: {
    amount: number;
    orderId: string;
    description: string;
    returnUrl?: string;
    cancelUrl?: string;
    [key: string]: any;
  }): Promise<{
    paymentUrl: string;
    transactionId: string;
  }>;

  /**
   * Verify payment callback từ gateway
   * @param params Callback parameters từ gateway
   * @returns Verification result
   */
  verifyPayment(params: {
    transactionId: string;
    amount: number;
    [key: string]: any;
  }): Promise<{
    success: boolean;
    transactionId: string;
    amount: number;
    message?: string;
  }>;
}
