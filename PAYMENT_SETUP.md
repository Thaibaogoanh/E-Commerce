# Payment Setup Guide

## Current Status
✅ Payment service is **working in MOCK MODE**
- Orders can be created
- Payment endpoint responds with mock data
- No real payment is processed

## To Enable Real VNPay Payment

### 1. Register VNPay Merchant Account
Visit: https://sandbox.vnpayment.vn/

### 2. Get Credentials
After registration, you'll receive:
- **TMN Code** (Merchant Code)
- **Secret Key** (Merchant Secret)

### 3. Add to .env file
Edit `retail-store-nestjs/.env` and add:

```env
VNPAY_TMN_CODE=your_tmn_code_here
VNPAY_SECRET_KEY=your_secret_key_here
VNPAY_RETURN_URL=http://localhost:3000/payment/callback
VNPAY_CANCEL_URL=http://localhost:3000/payment/cancel
VNPAY_API_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

Replace `your_tmn_code_here` and `your_secret_key_here` with actual values.

### 4. Restart Backend
```bash
npm run start:dev
```

### 5. Test Payment Flow
1. Add product to cart
2. Checkout
3. Select "VNPay" as payment method
4. Should redirect to VNPay test payment page

## Payment Methods Supported

### Current:
- ✅ **VNPay** (Sandbox & Production)
- ✅ **MoMo** (Not implemented yet)
- ✅ **COD** (Cash on Delivery)

### Implementation Status:
- **VNPay**: Ready (need credentials)
- **MoMo**: Gateway interface ready, need implementation
- **COD**: Already working (no payment needed)

## Test Credentials (Sandbox)
For testing without real account:

**Test Card:**
- Card Number: `9704198526191432198`
- Expiry: `0720` (07/2020)
- CVV: `123`
- OTP: `123456`

## API Endpoints

### Create Payment
```
POST /api/payments/initiate
Authorization: Bearer {token}
Body:
{
  "orderId": "order-uuid",
  "amount": 750000,
  "paymentMethodId": "vnpay",
  "description": "Payment for order #xxx"
}
```

### VNPay Callback
```
GET /api/payments/callback/vnpay?paymentId={id}&vnp_ResponseCode=00&...
```

## Files Modified
- `src/modules/payment/payment.service.ts` - Payment initiation logic
- `src/modules/payment/gateways/vnpay.gateway.ts` - VNPay implementation
- `src/entities/payment.entity.ts` - Payment data model
- `src/entities/payment-method.entity.ts` - Added MethodName for gateway methods

## Troubleshooting

### "VNPay credentials not configured"
**Solution**: Add VNPAY_TMN_CODE and VNPAY_SECRET_KEY to .env

### Payment always shows "mock mode"
**Solution**: Check .env for valid credentials, restart backend

### VNPay redirect not working
**Solution**: Verify VNPAY_API_URL and VNPAY_RETURN_URL are correct

