# 🔄 API Flow & Endpoints - Tổng hợp Chi tiết

Tất cả các endpoint, request/response flow, và sequence của hệ thống thương mại điện tử TMDT.

---

## 📋 Mục Lục

1. [Authentication Flow](#-authentication-flow)
2. [Shopping Flow](#-shopping-flow)
3. [Order & Payment Flow](#-order--payment-flow)
4. [User Management](#-user-management)
5. [Product Management](#-product-management)
6. [Cart & Checkout](#-cart--checkout)
7. [Payment Processing](#-payment-processing)
8. [Order Tracking](#-order-tracking)
9. [Customizer & Design](#-customizer--design)
10. [Admin APIs](#-admin-apis)

---

## 🔐 Authentication Flow

### 1. User Registration
```
POST /api/auth/register
Content-Type: application/json

REQUEST:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+84901234567",
  "address": "123 Main St, Ho Chi Minh"
}

RESPONSE (201):
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "phone": "+84901234567",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. User Login
```
POST /api/auth/login
Content-Type: application/json

REQUEST:
{
  "email": "john@example.com",
  "password": "password123"
}

RESPONSE (200):
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Get Current User Profile
```
GET /api/auth/profile
Authorization: Bearer {token}

RESPONSE (200):
{
  "id": "uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "phone": "+84901234567",
  "address": "123 Main St",
  "image": "https://...",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### 4. Update Profile
```
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "name": "John Doe Updated",
  "phone": "+84901234567",
  "address": "456 New St",
  "image": "data:image/..."
}

RESPONSE (200):
{
  "id": "uuid",
  "name": "John Doe Updated",
  "phone": "+84901234567",
  ...
}
```

### 5. Change Password
```
PUT /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}

RESPONSE (200):
{
  "message": "Password changed successfully"
}
```

---

## 🛍️ Shopping Flow

### 1. Browse Categories
```
GET /api/categories
Authorization: (optional)

QUERY PARAMS:
- page=1
- limit=10
- parentId=uuid (for sub-categories)

RESPONSE (200):
[
  {
    "id": "uuid",
    "name": "T-Shirts",
    "description": "...",
    "image": "https://...",
    "parentId": null,
    "isActive": true,
    "children": [...]
  },
  ...
]
```

### 2. Get Category Tree
```
GET /api/categories/tree
Authorization: (optional)

RESPONSE (200):
[
  {
    "id": "uuid",
    "name": "Apparel",
    "children": [
      {
        "id": "uuid",
        "name": "T-Shirts",
        "children": []
      }
    ]
  }
]
```

### 3. View Products by Category
```
GET /api/categories/:categoryId/products
Authorization: (optional)

QUERY PARAMS:
- page=1
- limit=10
- sortBy=price
- order=asc

RESPONSE (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "Classic T-Shirt",
      "price": 150000,
      "rating": 4.5,
      "image": "https://...",
      "category": { "id": "uuid", "name": "T-Shirts" }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

### 4. Get All Products
```
GET /api/products
Authorization: (optional)

QUERY PARAMS:
- page=1
- limit=10
- search=shirt
- categoryId=uuid
- minPrice=50000
- maxPrice=500000
- sortBy=createdAt|price|rating
- order=asc|desc

RESPONSE (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "...",
      "basePrice": 150000,
      "rating": 4.5,
      "reviewCount": 120,
      "stock": 50,
      "isActive": true,
      "images": ["https://..."],
      "category": {...},
      "materials": [...]
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

### 5. Get Single Product Details
```
GET /api/products/:productId
Authorization: (optional)

RESPONSE (200):
{
  "id": "uuid",
  "name": "Classic T-Shirt",
  "description": "High quality cotton t-shirt",
  "basePrice": 150000,
  "category": {
    "id": "uuid",
    "name": "T-Shirts"
  },
  "materials": [
    { "MatID": "uuid", "name": "Cotton 100%", "price": 10000 }
  ],
  "sizes": [
    { "SizeCode": "S", "chest_cm": 90 },
    { "SizeCode": "M", "chest_cm": 100 }
  ],
  "colors": [
    { "ColorCode": "BLACK", "ColorName": "Black", "hex": "#000000" }
  ],
  "printMethods": [
    { "id": "uuid", "name": "Screen Print", "price": 50000 }
  ],
  "images": ["https://..."],
  "skuVariants": [
    {
      "SkuID": "uuid",
      "productId": "uuid",
      "ColorCode": "BLACK",
      "SizeCode": "M",
      "sku_name": "BLACK-M",
      "price": 150000,
      "stock": 50
    }
  ],
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Great quality!",
      "user": { "name": "John" },
      "createdAt": "2025-01-01T..."
    }
  ],
  "rating": 4.8,
  "reviewCount": 45
}
```

### 6. Get Featured Products
```
GET /api/products/featured
Authorization: (optional)

RESPONSE (200):
[
  { "id": "uuid", "name": "...", "price": 150000, ... }
]
```

### 7. Get Trending Products (Neo4j AI)
```
GET /api/products/ai/trending
Authorization: (optional)

RESPONSE (200):
[
  { "id": "uuid", "name": "...", "trending_score": 0.95 }
]
```

### 8. Get Similar Products (Neo4j AI)
```
GET /api/products/ai/similar/:productId
Authorization: (optional)

RESPONSE (200):
[
  { "id": "uuid", "name": "...", "similarity": 0.85 }
]
```

### 9. Get Frequently Bought Together
```
GET /api/products/ai/frequently-bought/:productId
Authorization: (optional)

RESPONSE (200):
[
  { "id": "uuid", "name": "...", "frequency": 0.75 }
]
```

---

## 🛒 Cart & Checkout

### 1. View Cart
```
GET /api/cart
Authorization: Bearer {token}

RESPONSE (200):
{
  "id": "uuid",
  "userId": "uuid",
  "totalAmount": 450000,
  "itemCount": 3,
  "isActive": true,
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "price": 150000,
      "subtotal": 300000,
      "colorCode": "BLACK",
      "sizeCode": "M",
      "product": {
        "id": "uuid",
        "name": "Classic T-Shirt",
        "price": 150000,
        "image": "https://..."
      }
    }
  ],
  "createdAt": "2025-01-01T...",
  "updatedAt": "2025-01-01T..."
}
```

### 2. Get Cart Summary
```
GET /api/cart/summary
Authorization: Bearer {token}

RESPONSE (200):
{
  "totalItems": 3,
  "totalAmount": 450000,
  "items": [
    {
      "productId": "uuid",
      "productName": "Classic T-Shirt",
      "quantity": 2,
      "price": 150000,
      "subtotal": 300000
    }
  ]
}
```

### 3. Add to Cart
```
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "productId": "uuid",
  "quantity": 2,
  "colorCode": "BLACK",
  "sizeCode": "M",
  "customDesignData": {
    "elements": [
      {
        "id": "element1",
        "type": "text",
        "content": "Hello",
        "x": 100,
        "y": 100,
        "fontSize": 24,
        "color": "#FFFFFF"
      }
    ],
    "color": "BLACK",
    "size": "M"
  }
}

RESPONSE (201):
{
  "id": "uuid",
  "cartId": "uuid",
  "productId": "uuid",
  "quantity": 2,
  "price": 150000,
  "subtotal": 300000,
  "message": "Added to cart successfully"
}
```

### 4. Update Cart Item
```
PATCH /api/cart/items/:itemId
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "quantity": 3
}

RESPONSE (200):
{
  "id": "uuid",
  "quantity": 3,
  "subtotal": 450000
}
```

### 5. Remove from Cart
```
DELETE /api/cart/items/:itemId
Authorization: Bearer {token}

RESPONSE (200):
{
  "message": "Item removed from cart"
}
```

### 6. Clear Cart
```
DELETE /api/cart/clear
Authorization: Bearer {token}

RESPONSE (200):
{
  "message": "Cart cleared successfully"
}
```

### 7. Apply Voucher to Cart
```
POST /api/cart/apply-voucher
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "voucherCode": "SAVE20"
}

RESPONSE (200):
{
  "cartId": "uuid",
  "voucherCode": "SAVE20",
  "discountAmount": 90000,
  "totalAmount": 360000,
  "message": "Voucher applied successfully"
}
```

---

## 💳 Payment Processing

### 1. Initiate Payment (VNPay)
```
POST /api/payments/initiate
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "orderId": "uuid",
  "amount": 450000,
  "description": "Payment for order #ORD123"
}

RESPONSE (201):
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paygate/pay.html?...",
  "transactionId": "TXN20250101001",
  "message": "Payment initiated. Redirect to VNPay to complete payment."
}
```

### 2. VNPay Callback
```
GET /api/payments/callback/vnpay
QUERY PARAMS: vnp_Amount, vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash, ...

RESPONSE (200):
{
  "success": true,
  "message": "Payment successful",
  "orderId": "uuid",
  "transactionId": "TXN20250101001"
}
```

### 3. Verify Payment
```
POST /api/payments/:paymentId/verify
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "transactionId": "TXN20250101001",
  "amount": 450000,
  "vnp_SecureHash": "..."
}

RESPONSE (200):
{
  "success": true,
  "transactionId": "TXN20250101001",
  "amount": 450000,
  "message": "Payment verified successfully"
}
```

### 4. Get Payment Status
```
GET /api/payments/:paymentId/status
Authorization: Bearer {token}

RESPONSE (200):
{
  "id": "uuid",
  "orderId": "uuid",
  "amount": 450000,
  "status": "PAID",
  "transactionId": "TXN20250101001",
  "paymentMethod": "VNPAY",
  "createdAt": "2025-01-01T...",
  "completedAt": "2025-01-01T..."
}
```

### 5. Cancel Payment
```
POST /api/payments/:paymentId/cancel
Authorization: Bearer {token}

RESPONSE (200):
{
  "message": "Payment cancelled successfully",
  "refundAmount": 450000
}
```

---

## 📦 Order Management

### 1. Create Order
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "items": [
    {
      "cartItemId": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "price": 150000
    }
  ],
  "shippingAddressId": "uuid",
  "paymentMethodId": "uuid",
  "voucherCode": "SAVE20",
  "notes": "Please pack carefully"
}

RESPONSE (201):
{
  "id": "uuid",
  "userId": "uuid",
  "Status": "PENDING",
  "paymentStatus": "PENDING",
  "totalAmount": 360000,
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "unit_price": 150000
    }
  ],
  "shippingAddress": {
    "id": "uuid",
    "street": "123 Main St",
    "city": "Ho Chi Minh",
    "country": "Vietnam"
  },
  "message": "Order created. Please proceed to payment."
}
```

### 2. Get All Orders
```
GET /api/orders
Authorization: Bearer {token} (user sees own orders)

QUERY PARAMS:
- page=1
- limit=10
- status=PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED
- paymentStatus=PENDING|PAID|FAILED|REFUNDED

RESPONSE (200):
{
  "data": [
    {
      "id": "uuid",
      "Status": "SHIPPED",
      "paymentStatus": "PAID",
      "totalAmount": 360000,
      "itemCount": 2,
      "createdAt": "2025-01-01T...",
      "updatedAt": "2025-01-02T..."
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### 3. Get My Orders
```
GET /api/orders/my-orders
Authorization: Bearer {token}

RESPONSE (200):
[
  {
    "id": "uuid",
    "Status": "SHIPPED",
    "totalAmount": 360000,
    "items": [...],
    "createdAt": "2025-01-01T..."
  }
]
```

### 4. Get Single Order
```
GET /api/orders/:orderId
Authorization: Bearer {token}

RESPONSE (200):
{
  "id": "uuid",
  "userId": "uuid",
  "Status": "SHIPPED",
  "paymentStatus": "PAID",
  "totalAmount": 360000,
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "unit_price": 150000,
      "product": {
        "id": "uuid",
        "name": "Classic T-Shirt",
        "image": "https://..."
      }
    }
  ],
  "shippingAddress": {...},
  "paymentMethod": {...},
  "shipment": {
    "id": "uuid",
    "status": "IN_TRANSIT",
    "trackingNumber": "VN123456789"
  }
}
```

### 5. Update Order Status (Admin)
```
PATCH /api/orders/:orderId/status
Authorization: Bearer {admin_token}
Content-Type: application/json

REQUEST:
{
  "status": "CONFIRMED"
}

RESPONSE (200):
{
  "id": "uuid",
  "Status": "CONFIRMED",
  "message": "Order status updated"
}
```

### 6. Update Payment Status (Admin)
```
PATCH /api/orders/:orderId/payment-status
Authorization: Bearer {admin_token}
Content-Type: application/json

REQUEST:
{
  "paymentStatus": "PAID"
}

RESPONSE (200):
{
  "id": "uuid",
  "paymentStatus": "PAID"
}
```

### 7. Cancel Order
```
PATCH /api/orders/:orderId/cancel
Authorization: Bearer {token}

RESPONSE (200):
{
  "id": "uuid",
  "Status": "CANCELLED",
  "message": "Order cancelled successfully"
}
```

---

## 📍 Order Tracking

### 1. Get Order Tracking
```
GET /api/orders/:orderId/tracking
Authorization: Bearer {token}

RESPONSE (200):
{
  "orderId": "uuid",
  "shipments": [
    {
      "id": "uuid",
      "trackingNumber": "VN123456789",
      "carrier": "GHN",
      "status": "IN_TRANSIT",
      "estimatedDelivery": "2025-01-05",
      "trackingUrl": "https://ghn.vn/tracking/...",
      "events": [
        {
          "status": "PICKED_UP",
          "location": "Ho Chi Minh Warehouse",
          "timestamp": "2025-01-01T08:00:00Z"
        },
        {
          "status": "IN_TRANSIT",
          "location": "Binh Duong Hub",
          "timestamp": "2025-01-01T14:00:00Z"
        }
      ]
    }
  ]
}
```

---

## 🎨 Customizer & Design

### 1. Save Custom Design
```
POST /api/customizer/save
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "name": "My Custom Design",
  "productId": "uuid",
  "elements": [
    {
      "id": "element1",
      "type": "text",
      "content": "Custom Text",
      "x": 100,
      "y": 100,
      "fontSize": 24,
      "color": "#FFFFFF"
    }
  ],
  "color": "BLACK",
  "size": "M"
}

RESPONSE (201):
{
  "id": "uuid",
  "userId": "uuid",
  "name": "My Custom Design",
  "productId": "uuid",
  "createdAt": "2025-01-01T..."
}
```

### 2. Get My Saved Designs
```
GET /api/customizer/saved
Authorization: Bearer {token}

RESPONSE (200):
[
  {
    "id": "uuid",
    "name": "My Custom Design",
    "productId": "uuid",
    "thumbnail": "https://...",
    "createdAt": "2025-01-01T..."
  }
]
```

### 3. Get Single Saved Design
```
GET /api/customizer/saved/:designId
Authorization: Bearer {token}

RESPONSE (200):
{
  "id": "uuid",
  "name": "My Custom Design",
  "productId": "uuid",
  "elements": [...],
  "color": "BLACK",
  "size": "M"
}
```

### 4. Delete Saved Design
```
DELETE /api/customizer/saved/:designId
Authorization: Bearer {token}

RESPONSE (200):
{
  "message": "Design deleted successfully"
}
```

### 5. Calculate Customization Price
```
POST /api/customizer/calculate-price
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "productId": "uuid",
  "colorCode": "BLACK",
  "sizeCode": "M",
  "customDesignData": {
    "hasCustomDesign": true,
    "designType": "screen-print",
    "printAreas": 1,
    "colors": 1
  }
}

RESPONSE (200):
{
  "basePrice": 150000,
  "customizationFee": 50000,
  "printingFee": 30000,
  "totalPrice": 230000,
  "breakdown": {
    "base": 150000,
    "design": 50000,
    "printing": 30000
  }
}
```

---

## 🎁 Vouchers & Rewards

### 1. Validate Voucher
```
GET /api/vouchers/validate
Authorization: Bearer {token}

QUERY PARAMS:
- code=SAVE20
- orderAmount=450000 (optional)

RESPONSE (200):
{
  "isValid": true,
  "code": "SAVE20",
  "type": "PERCENTAGE",
  "value": 20,
  "discountAmount": 90000,
  "message": "Voucher is valid"
}
```

### 2. Get My Vouchers
```
GET /api/vouchers/my-vouchers
Authorization: Bearer {token}

RESPONSE (200):
[
  {
    "id": "uuid",
    "voucherId": "uuid",
    "code": "SAVE20",
    "discount": 20,
    "discountType": "PERCENTAGE",
    "status": "AVAILABLE",
    "expiresAt": "2025-12-31T..."
  }
]
```

### 3. Get Reward Points
```
GET /api/rewards/points
Authorization: Bearer {token}

RESPONSE (200):
{
  "totalPoints": 5000,
  "availablePoints": 5000,
  "usedPoints": 0,
  "tier": "SILVER",
  "nextTier": "GOLD",
  "pointsToNextTier": 2000
}
```

### 4. Get Reward History
```
GET /api/rewards/history
Authorization: Bearer {token}

QUERY PARAMS:
- page=1
- limit=10
- type=EARNED|REDEEMED|EXPIRED

RESPONSE (200):
[
  {
    "id": "uuid",
    "type": "EARNED",
    "points": 100,
    "source": "PURCHASE",
    "sourceId": "uuid",
    "description": "Earned from order #ORD123",
    "createdAt": "2025-01-01T..."
  }
]
```

### 5. Get Reward Catalog
```
GET /api/rewards/catalog
Authorization: Bearer {token}

RESPONSE (200):
[
  {
    "id": "uuid",
    "name": "Discount Voucher 50k",
    "type": "VOUCHER",
    "pointsRequired": 1000,
    "value": 50000,
    "description": "Get 50k discount voucher",
    "quantity": 100
  }
]
```

### 6. Redeem Reward
```
POST /api/rewards/redeem/:rewardId
Authorization: Bearer {token}

RESPONSE (201):
{
  "id": "uuid",
  "userId": "uuid",
  "rewardId": "uuid",
  "pointsUsed": 1000,
  "reward": {
    "name": "Discount Voucher 50k",
    "value": 50000
  },
  "message": "Reward redeemed successfully"
}
```

---

## 👥 User Management

### 1. Get All Users (Admin)
```
GET /api/users
Authorization: Bearer {admin_token}

QUERY PARAMS:
- page=1
- limit=10
- role=USER|ADMIN|EMPLOYEE
- isActive=true|false

RESPONSE (200):
{
  "data": [
    {
      "UserID": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "USER",
      "is_active": true,
      "createdAt": "2025-01-01T..."
    }
  ],
  "total": 150,
  "page": 1
}
```

### 2. Get User Stats (Admin)
```
GET /api/users/stats
Authorization: Bearer {admin_token}

RESPONSE (200):
{
  "totalUsers": 150,
  "activeUsers": 120,
  "newUsersThisMonth": 15,
  "totalRevenue": 50000000,
  "averageOrderValue": 300000
}
```

### 3. Get User Profile
```
GET /api/users/profile
Authorization: Bearer {token}

RESPONSE (200):
{
  "UserID": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "phone": "+84901234567",
  "password_hash": "...",
  "image": "https://...",
  "role": "USER",
  "is_active": true,
  "createdAt": "2025-01-01T..."
}
```

### 4. Update User Profile
```
PATCH /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "name": "New Name",
  "phone": "+84901234567",
  "image": "data:image/..."
}

RESPONSE (200):
{
  "UserID": "uuid",
  "name": "New Name",
  "phone": "+84901234567"
}
```

### 5. Change Password
```
PATCH /api/users/profile/change-password
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}

RESPONSE (200):
{
  "message": "Password changed successfully"
}
```

---

## ⭐ Reviews

### 1. Create Review
```
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Great product! Very satisfied with quality.",
  "images": ["https://..."]
}

RESPONSE (201):
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "rating": 5,
  "comment": "Great product!",
  "verified": true,
  "createdAt": "2025-01-01T..."
}
```

### 2. Get Product Reviews
```
GET /api/reviews/product/:productId
Authorization: (optional)

QUERY PARAMS:
- page=1
- limit=10
- rating=5 (filter by rating)
- sortBy=createdAt|helpful
- order=desc|asc

RESPONSE (200):
{
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Great product!",
      "user": { "name": "John", "image": "..." },
      "helpful": 12,
      "createdAt": "2025-01-01T..."
    }
  ],
  "total": 45,
  "average": 4.8
}
```

### 3. Get Review Stats
```
GET /api/reviews/product/:productId/stats
Authorization: (optional)

RESPONSE (200):
{
  "productId": "uuid",
  "totalReviews": 45,
  "averageRating": 4.8,
  "ratingDistribution": {
    "5": 30,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 1
  }
}
```

### 4. Update Review
```
PATCH /api/reviews/:reviewId
Authorization: Bearer {token}
Content-Type: application/json

REQUEST:
{
  "rating": 4,
  "comment": "Updated comment"
}

RESPONSE (200):
{
  "id": "uuid",
  "rating": 4,
  "comment": "Updated comment"
}
```

### 5. Delete Review
```
DELETE /api/reviews/:reviewId
Authorization: Bearer {token}

RESPONSE (200):
{
  "message": "Review deleted successfully"
}
```

---

## 📋 Complete Customer Journey (Sequence Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER SHOPPING JOURNEY                      │
└─────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION
   ├─ POST /api/auth/register        → Create account
   └─ POST /api/auth/login           → Get JWT token

2. BROWSING
   ├─ GET /api/categories            → View categories
   ├─ GET /api/categories/tree       → View category tree
   ├─ GET /api/products              → View all products
   ├─ GET /api/products/:id          → View product details
   ├─ GET /api/products/ai/trending  → Get trending products
   └─ GET /api/products/ai/similar   → Get similar products

3. CUSTOMIZATION (Optional)
   ├─ POST /api/customizer/calculate-price  → Calculate price
   ├─ POST /api/customizer/save            → Save design
   └─ GET /api/customizer/saved/:designId  → Load saved design

4. SHOPPING CART
   ├─ GET /api/cart                         → View cart
   ├─ POST /api/cart/add                    → Add item to cart
   ├─ PATCH /api/cart/items/:itemId        → Update quantity
   ├─ DELETE /api/cart/items/:itemId       → Remove item
   ├─ GET /api/vouchers/validate           → Validate voucher
   └─ POST /api/cart/apply-voucher         → Apply voucher

5. CHECKOUT
   ├─ GET /api/addresses                    → View addresses
   ├─ POST /api/addresses                   → Add new address
   ├─ GET /api/payment-methods             → View payment methods
   └─ POST /api/orders                      → Create order

6. PAYMENT
   ├─ POST /api/payments/initiate          → Start payment
   ├─ GET /api/payments/callback/vnpay     → VNPay callback
   └─ POST /api/payments/:id/verify        → Verify payment

7. ORDER TRACKING
   ├─ GET /api/orders/my-orders            → View my orders
   ├─ GET /api/orders/:orderId             → View order details
   ├─ GET /api/orders/:orderId/tracking    → Track shipment
   └─ GET /api/shipments/order/:orderId    → Get shipping info

8. REVIEWS & FEEDBACK
   ├─ POST /api/reviews                    → Write review
   ├─ GET /api/reviews/product/:id         → View reviews
   └─ PATCH /api/reviews/:id               → Update review

9. REWARDS (After purchase)
   ├─ GET /api/rewards/points              → Check reward points
   ├─ GET /api/rewards/history             → View reward history
   ├─ GET /api/rewards/catalog             → View reward catalog
   └─ POST /api/rewards/redeem/:id         → Redeem reward
```

---

## 🔗 API Grouping by Feature

### Authentication APIs
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile
- PUT /api/auth/profile
- PUT /api/auth/change-password
- POST /api/auth/forgot-password

### Product APIs
- GET /api/products
- GET /api/products/:id
- GET /api/products/featured
- GET /api/products/new
- GET /api/products/blanks
- GET /api/products/ready-made
- GET /api/products/ai/trending
- GET /api/products/ai/similar/:id
- GET /api/products/ai/frequently-bought/:id
- GET /api/products/ai/recommended
- POST /api/products (Admin)
- PATCH /api/products/:id (Admin)
- DELETE /api/products/:id (Admin)

### Category APIs
- GET /api/categories
- GET /api/categories/tree
- GET /api/categories/:id
- GET /api/categories/:id/products
- POST /api/categories (Admin)
- PATCH /api/categories/:id (Admin)
- DELETE /api/categories/:id (Admin)

### Cart APIs
- GET /api/cart
- GET /api/cart/summary
- POST /api/cart/add
- PATCH /api/cart/items/:id
- DELETE /api/cart/items/:id
- DELETE /api/cart/clear
- POST /api/cart/apply-voucher

### Order APIs
- POST /api/orders
- GET /api/orders
- GET /api/orders/my-orders
- GET /api/orders/:id
- GET /api/orders/stats
- PATCH /api/orders/:id/status (Admin)
- PATCH /api/orders/:id/payment-status (Admin)
- PATCH /api/orders/:id/cancel

### Payment APIs
- POST /api/payments/initiate
- GET /api/payments/callback/vnpay
- POST /api/payments/:id/verify
- GET /api/payments/:id/status
- POST /api/payments/:id/cancel

### Shipment APIs
- GET /api/shipments/order/:orderId
- GET /api/shipments/:id/tracking
- POST /api/shipments/:id/tracking
- POST /api/shipments/:id/items

### Review APIs
- POST /api/reviews
- GET /api/reviews
- GET /api/reviews/stats
- GET /api/reviews/product/:id
- GET /api/reviews/product/:id/stats
- GET /api/reviews/my-reviews
- GET /api/reviews/:id
- PATCH /api/reviews/:id
- DELETE /api/reviews/:id

### Design & Customizer APIs
- GET /api/designs
- GET /api/designs/:id
- POST /api/designs
- PATCH /api/designs/:id (Admin)
- POST /api/designs/:id/approve (Admin)
- POST /api/designs/:id/reject (Admin)
- GET /api/customizer/save
- GET /api/customizer/saved
- POST /api/customizer/save
- GET /api/customizer/saved/:id
- DELETE /api/customizer/saved/:id
- POST /api/customizer/calculate-price

### Address APIs
- GET /api/addresses
- GET /api/addresses/:id
- POST /api/addresses
- PATCH /api/addresses/:id
- PATCH /api/addresses/:id/set-default
- DELETE /api/addresses/:id

### Voucher & Rewards APIs
- GET /api/vouchers/validate
- GET /api/vouchers/my-vouchers
- GET /api/rewards/points
- GET /api/rewards/history
- GET /api/rewards/catalog
- POST /api/rewards/redeem/:id

### User APIs
- GET /api/users (Admin)
- GET /api/users/stats (Admin)
- GET /api/users/profile
- GET /api/users/:id (Admin)
- PATCH /api/users/:id (Admin)
- PATCH /api/users/profile/change-password
- PATCH /api/users/:id/activate (Admin)
- PATCH /api/users/:id/deactivate (Admin)
- DELETE /api/users/:id (Admin)

### Admin Dashboard APIs
- GET /api/users/dashboard/stats
- GET /api/users/dashboard/recent-orders
- GET /api/users/dashboard/trees-planted

### Catalog Management APIs
- GET /api/sizes
- POST /api/sizes (Admin)
- GET /api/materials
- POST /api/materials (Admin)
- GET /api/print-methods
- POST /api/print-methods (Admin)

### Inventory APIs
- GET /api/inventory/stock
- GET /api/inventory/stock/:skuId
- POST /api/inventory/stock/:skuId/inbound (Admin)
- POST /api/inventory/stock/:skuId/outbound (Admin)
- POST /api/inventory/stock/:skuId/reserve
- POST /api/inventory/stock/:skuId/release
- GET /api/inventory/stock/:skuId/movements

---

## 🔑 Authentication

All protected endpoints require:
```
Authorization: Bearer {jwt_token}
```

Token format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE2Nzc5OTk5OTksImV4cCI6MTY3ODA4NjM5OX0.signature
```

Roles:
- `USER` - Regular customer
- `ADMIN` - Site administrator
- `EMPLOYEE` - Staff member

---

## ✅ Success Responses

All success responses follow:
```json
{
  "data": {},
  "message": "Success message",
  "statusCode": 200
}
```

## ❌ Error Responses

All error responses follow:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "BadRequest"
}
```

Common status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error





