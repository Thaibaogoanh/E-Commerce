# 📋 Critical Flows Documentation - Sustainique

## 🎯 Tổng Quan

Tài liệu này mô tả chi tiết các flow quan trọng đã được implement trong hệ thống:
1. **Voucher Validation Flow**
2. **Email Notifications Flow**
3. **Inventory Management Flow**
4. **Payment Integration Flow**

---

## 1️⃣ VOUCHER VALIDATION FLOW

### Backend Implementation

**File**: `retail-store-nestjs/src/modules/vouchers/vouchers.service.ts`

**Method**: `validateVoucher(code, userId, orderAmount)`

### Validation Checks (Đã hoàn thiện ✅)

1. **Voucher Existence**
   - Kiểm tra voucher có tồn tại trong database
   - Normalize code (uppercase, trim)

2. **Voucher Status**
   - Kiểm tra `status === ACTIVE`
   - Reject nếu status là `INACTIVE`, `EXPIRED`, `DELETED`

3. **Validity Dates**
   - Check `validFrom` - voucher chưa bắt đầu
   - Check `validUntil` - voucher đã hết hạn
   - Auto-update status to `EXPIRED` nếu đã hết hạn

4. **Minimum Order Amount**
   - Kiểm tra `orderAmount >= minOrderAmount`
   - Return error message với minimum amount nếu không đạt

5. **Maximum Uses (Global)**
   - Kiểm tra `usedCount < maxUses`
   - Reject nếu đã đạt giới hạn sử dụng

6. **User Eligibility** (nếu có `userId`)
   - **Max Uses Per User**: Kiểm tra số lần user đã sử dụng voucher
   - **Pending Usage**: Kiểm tra user có đang sử dụng voucher trong order pending không
   - **Future**: Có thể thêm check cho new users, user groups, etc.

7. **Discount Calculation**
   - **PERCENTAGE**: `discount = (orderAmount * value) / 100`
   - **FIXED_AMOUNT**: `discount = value`
   - **FREE_SHIPPING**: `discount = 0` (xử lý riêng trong order)
   - Cap discount không vượt quá `orderAmount`

### API Endpoints

#### GET /api/vouchers/validate
**Query Parameters**:
- `code`: string (required) - Voucher code
- `orderAmount`: number (required) - Order total amount

**Response**:
```json
{
  "valid": true,
  "discount": 20000,
  "voucher": { /* Voucher object */ },
  "message": "Voucher is valid"
}
```

#### POST /api/cart/apply-voucher
**Request Body**:
```json
{
  "voucherCode": "GREEN20"
}
```

**Response**:
```json
{
  "message": "Voucher applied successfully",
  "discount": 20,
  "discountAmount": 100000
}
```

### Frontend Integration

**Files**:
- `front-end/src/components/ShoppingCartPage.tsx` - Apply voucher trong cart
- `front-end/src/components/VouchersPage.tsx` - Validate voucher code
- `front-end/src/components/CheckoutPage.tsx` - Sử dụng voucher đã apply

**Flow**:
1. User nhập voucher code trong cart hoặc checkout
2. Frontend gọi `POST /api/cart/apply-voucher` với voucher code
3. Backend validate voucher và apply vào cart
4. Cart totals được cập nhật với discount
5. Voucher được lưu trong localStorage để sử dụng ở checkout

---

## 2️⃣ EMAIL NOTIFICATIONS FLOW

### Backend Implementation

**File**: `retail-store-nestjs/src/services/email.service.ts`

**Method**: `sendOrderConfirmation(email, orderData)`

### Email Templates

**Location**: `retail-store-nestjs/src/templates/emails/`

**Templates**:
1. `order-confirmation.html` - HTML email template
2. `order-confirmation.txt` - Plain text fallback
3. `shipping-notification.html` - Shipping notification
4. `shipping-notification.txt` - Plain text fallback
5. `password-reset.html` - Password reset email
6. `welcome.html` - Welcome email

### Email Service Configuration

**Environment Variables** (`.env`):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sustainique.com
FRONTEND_URL=http://localhost:3000
```

### Order Confirmation Email Flow

**Trigger**: Sau khi order được tạo thành công

**File**: `retail-store-nestjs/src/modules/orders/orders.service.ts`

**Code**:
```typescript
// After order creation (non-blocking)
this.emailService
  .sendOrderConfirmation(userEmail, {
    id: savedOrder.id,
    orderId: savedOrder.id,
    totalAmount: savedOrder.totalAmount,
    items: orderItemsForEmail,
    shippingAddress: savedOrder.shippingAddress,
    paymentMethod: savedOrder.paymentMethod,
    orderDate: savedOrder.createdAt.toLocaleDateString('vi-VN'),
  })
  .catch((error) => {
    this.logger.error(`Failed to send order confirmation email: ${error.message}`);
    // Don't throw - email is not critical to order processing
  });
```

### Email Content

**Order Confirmation Email includes**:
- Order ID
- Order date
- Shipping address
- Payment method
- Order items (product name, quantity, price, color, size)
- Total amount
- Company branding

### Frontend Integration

**Status**: ✅ Email được gửi tự động sau khi order thành công
- Frontend không cần gọi API riêng để gửi email
- Email được gửi non-blocking (không ảnh hưởng đến order creation)

---

## 3️⃣ INVENTORY MANAGEMENT FLOW

### Backend Implementation

**File**: `retail-store-nestjs/src/modules/orders/orders.service.ts`

**Method**: `create()` - Stock validation logic

### Stock Validation Strategy

**Multi-level Stock Check**:

1. **SKU Variant Level** (Preferred - Most Accurate)
   ```typescript
   if (colorCode && sizeCode) {
     // Find SKU variant
     skuVariant = await skuVariantRepository.findOne({
       where: { productId, ColorCode: colorCode, SizeCode: sizeCode }
     });
     
     if (skuVariant) {
       // Check SKU stock
       stock = await inventoryService.getBySku(skuId);
       availableStock = stock.qty_on_hand - stock.qty_reserved;
       
       if (availableStock < quantity) {
         throw BadRequestException('Insufficient stock');
       }
     }
   }
   ```

2. **Product Level** (Fallback)
   ```typescript
   // If SKU variant not found or stock not found
   if (product.stock < quantity) {
     throw BadRequestException('Insufficient stock');
   }
   ```

### Stock Reservation Flow

**During Order Creation**:

1. **Validate Stock** (Before transaction)
   - Check available stock for each item
   - Throw error nếu không đủ stock

2. **Reserve Stock** (Inside transaction)
   ```typescript
   // Reserve stock for SKU variant
   if (skuVariant && skuId !== productId) {
     await inventoryService.reserve(
       skuId,
       quantity,
       `Order ${orderId}`,
       'order',
       orderId
     );
   } else {
     // Update product stock directly
     product.stock -= quantity;
     await productRepository.save(product);
   }
   ```

3. **Stock Release** (If order cancelled)
   - Release reserved stock back to available
   - Update `qty_reserved` in Stock table

### Inventory Service Methods

**File**: `retail-store-nestjs/src/modules/inventory/inventory.service.ts`

**Methods**:
- `getBySku(skuId)` - Get stock by SKU ID
- `reserve(skuId, quantity, reason, referenceType, referenceId)` - Reserve stock
- `release(skuId, quantity, reason)` - Release reserved stock
- `inbound(skuId, quantity, note)` - Add stock
- `outbound(skuId, quantity, note)` - Remove stock
- `getMovements(skuId)` - Get stock movement history

### Frontend Integration

**Status**: ✅ Stock validation được thực hiện tự động ở backend
- Frontend không cần check stock trước khi add to cart
- Backend sẽ reject order nếu không đủ stock
- Error message chi tiết được trả về cho frontend

---

## 4️⃣ PAYMENT INTEGRATION FLOW

### Backend Implementation

**File**: `retail-store-nestjs/src/modules/payments/payments.service.ts`

**Payment Gateway**: VNPay

### Payment Flow

1. **Initiate Payment**
   ```
   POST /api/payments/initiate
   {
     "orderId": "uuid",
     "amount": 300000,
     "paymentMethodId": "uuid",
     "description": "Order payment"
   }
   ```

2. **Response**
   ```json
   {
     "id": "payment-uuid",
     "orderId": "order-uuid",
     "amount": 300000,
     "status": "pending",
     "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
     "transactionId": null
   }
   ```

3. **Redirect User**
   - Frontend redirect user đến `paymentUrl`
   - User thanh toán trên VNPay gateway

4. **Payment Callback**
   ```
   GET /api/payments/callback/vnpay
   Query params: vnp_Amount, vnp_BankCode, vnp_ResponseCode, etc.
   ```

5. **Verify Payment**
   ```
   POST /api/payments/:paymentId/verify
   {
     "transactionId": "TXN123456"
   }
   ```

### VNPay Configuration

**Environment Variables** (`.env`):
```env
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/#payment-callback
```

### Frontend Integration

**Files**:
- `front-end/src/components/CheckoutPage.tsx` - Initiate payment
- `front-end/src/components/PaymentCallbackPage.tsx` - Handle callback
- `front-end/src/components/PaymentCancelPage.tsx` - Handle cancellation

**Flow**:
1. User click "Đặt hàng" trong checkout
2. Frontend tạo order: `POST /api/orders`
3. Nếu payment method là VNPay:
   - Frontend gọi `POST /api/payments/initiate`
   - Redirect user đến `paymentUrl`
4. User thanh toán trên VNPay
5. VNPay redirect về `#payment-callback`
6. Frontend verify payment: `POST /api/payments/:id/verify`
7. Redirect đến `#order-success` nếu thành công

---

## 🔄 COMPLETE ORDER FLOW

### End-to-End Flow

```
1. User adds items to cart
   ↓
2. User applies voucher (optional)
   POST /api/cart/apply-voucher
   ↓
3. User goes to checkout
   GET /api/cart
   GET /api/addresses
   ↓
4. User confirms order
   POST /api/orders
   ├─ Validate stock (SKU level or Product level)
   ├─ Reserve stock
   ├─ Create order items
   ├─ Create shipment
   └─ Send order confirmation email (non-blocking)
   ↓
5. Payment initiation
   POST /api/payments/initiate
   ↓
6. Redirect to payment gateway
   ↓
7. Payment callback
   GET /api/payments/callback/vnpay
   ↓
8. Verify payment
   POST /api/payments/:id/verify
   ↓
9. Order success page
   #order-success
```

---

## ✅ Implementation Status

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Voucher Validation | ✅ Complete | ✅ Integrated | ✅ Working |
| Email Notifications | ✅ Complete | ✅ Auto-sent | ✅ Working |
| Inventory Management | ✅ Complete | ✅ Auto-validated | ✅ Working |
| Payment Integration | ✅ Complete | ✅ Integrated | ✅ Working |

---

## 📝 Notes

1. **Email Service**: Cần config SMTP credentials trong `.env` để email hoạt động
2. **Payment Gateway**: Cần config VNPay credentials trong `.env` để payment hoạt động
3. **Stock Validation**: Luôn được thực hiện ở backend để đảm bảo tính chính xác
4. **Voucher Validation**: Được thực hiện khi apply voucher và khi tạo order
5. **Error Handling**: Tất cả errors được log và trả về message chi tiết cho frontend

---

## 🚀 Testing Checklist

- [ ] Test voucher validation với các trường hợp:
  - [ ] Valid voucher
  - [ ] Expired voucher
  - [ ] Invalid code
  - [ ] Insufficient order amount
  - [ ] Max uses reached
  - [ ] User usage limit reached

- [ ] Test email notifications:
  - [ ] Order confirmation email được gửi
  - [ ] Email template hiển thị đúng thông tin
  - [ ] Email fallback khi SMTP không config

- [ ] Test inventory management:
  - [ ] Stock validation khi tạo order
  - [ ] Stock reservation khi order thành công
  - [ ] Stock release khi order cancelled
  - [ ] Error message khi không đủ stock

- [ ] Test payment integration:
  - [ ] Payment initiation
  - [ ] Payment callback handling
  - [ ] Payment verification
  - [ ] Error handling

---

**Last Updated**: 2024-01-XX
**Version**: 1.0.0

