# 🌿 SUSTAINIQUE - Backend API Documentation

## 📖 Tổng Quan Dự Án

**Sustainique Backend** là hệ thống API backend cho website Print-on-Demand (POD) chuyên về thời trang bền vững và thân thiện với môi trường. Hệ thống được xây dựng bằng **NestJS** và **TypeScript**, sử dụng **PostgreSQL** (TypeORM) và **Neo4j** cho recommendations.

### 🎯 Slogan

**"YOUR STYLE. OUR PLANET."** - Phong cách của bạn, Hành tinh của chúng ta.

### ⭐ Đặc Điểm Nổi Bật

- ✅ Print-on-Demand (POD) system
- ✅ Customizer tool với save/load designs
- ✅ Hệ thống Green Points & Rewards
- ✅ Voucher management system
- ✅ Favorites/Wishlist
- ✅ Order management với shipment tracking
- ✅ Review system với media support
- ✅ SKU variants (Size, Color, Material)
- ✅ Design library management

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 12+ (TypeORM)
- **Graph Database**: Neo4j 4.x/5.x (Recommendations)
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: 18.x hoặc cao hơn
- **PostgreSQL**: 12.x hoặc cao hơn
- **Neo4j**: 4.x hoặc 5.x (optional, cho recommendations)
- **npm**: 9.x hoặc **yarn**: 1.x

---

## 🚀 Cài Đặt và Chạy Dự Án

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd retail-store-nestjs
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

### Bước 3: Thiết Lập Environment Variables

Tạo file `.env` trong thư mục root:

```env
# Application Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sustainique_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=30d

# Neo4j Database Configuration (Optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=neo4j

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Bước 4: Thiết Lập Databases

#### PostgreSQL

```sql
-- Tạo database
CREATE DATABASE sustainique_db;

-- Hoặc sử dụng psql
psql -U postgres
CREATE DATABASE sustainique_db;
```

#### Neo4j (Optional)

1. Download và cài đặt Neo4j Desktop hoặc Community Edition
2. Khởi động Neo4j server
3. Đảm bảo Neo4j chạy trên port 7687 (default)

### Bước 5: Chạy Database Migrations

TypeORM sẽ tự động tạo tables khi khởi động ứng dụng (synchronize: true trong development).

**Lưu ý**: Trong production, nên sử dụng migrations thay vì synchronize.

### Bước 6: Seed Database (Optional)

```bash
# Chạy seeder để tạo dữ liệu mẫu
npm run seed
```

### Bước 7: Chạy Ứng Dụng

#### Development Mode (với hot-reload)

```bash
npm run start:dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5000`

#### Production Mode

```bash
# Build project
npm run build

# Chạy production
npm run start:prod
```

#### Debug Mode

```bash
npm run start:debug
```

---

## 📁 Cấu Trúc Dự Án

```
retail-store-nestjs/
├── src/
│   ├── config/                 # Database configurations
│   │   ├── database.config.ts  # TypeORM configuration
│   │   └── neo4j.config.ts     # Neo4j service
│   ├── entities/               # TypeORM entities (33 entities)
│   │   ├── user.entity.ts
│   │   ├── product.entity.ts
│   │   ├── category.entity.ts
│   │   ├── order.entity.ts
│   │   ├── cart.entity.ts
│   │   ├── review.entity.ts
│   │   ├── address.entity.ts
│   │   ├── payment-method.entity.ts
│   │   ├── shipment.entity.ts
│   │   ├── design.entity.ts
│   │   ├── sku-variant.entity.ts
│   │   ├── saved-design.entity.ts
│   │   ├── favorite.entity.ts
│   │   ├── voucher.entity.ts
│   │   ├── reward-point.entity.ts
│   │   └── ... (33 entities total)
│   ├── modules/                # Feature modules (17 modules)
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── products/          # Product management
│   │   ├── categories/       # Category management
│   │   ├── orders/           # Order processing
│   │   ├── cart/             # Shopping cart
│   │   ├── reviews/          # Review system
│   │   ├── addresses/        # Address management
│   │   ├── payment-methods/  # Payment methods
│   │   ├── shipments/        # Shipment tracking
│   │   ├── designs/          # Design library
│   │   ├── sku-variants/     # SKU variants
│   │   ├── customizer/       # Customizer tool
│   │   ├── favorites/        # Favorites/Wishlist
│   │   ├── rewards/          # Green Points & Rewards
│   │   └── vouchers/         # Voucher management
│   ├── dto/                   # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── user.dto.ts
│   │   ├── product.dto.ts
│   │   ├── order.dto.ts
│   │   ├── cart.dto.ts
│   │   ├── review.dto.ts
│   │   └── category.dto.ts
│   ├── guards/                # Authentication guards
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── admin.guard.ts
│   ├── interceptors/          # Response interceptors
│   ├── seeders/               # Database seeders
│   │   ├── seed.ts
│   │   └── sample-data.ts
│   ├── app.module.ts         # Root module
│   ├── app.controller.ts     # Root controller
│   └── main.ts               # Application entry point
├── test/                      # E2E tests
├── dist/                      # Compiled JavaScript (after build)
├── .env                       # Environment variables (create this)
├── package.json
├── tsconfig.json
└── README.md                  # This file
```

---

## 🔗 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint                    | Description           | Auth Required |
| ------ | --------------------------- | --------------------- | ------------- |
| POST   | `/api/auth/register`        | Đăng ký tài khoản mới | ❌            |
| POST   | `/api/auth/login`           | Đăng nhập             | ❌            |
| GET    | `/api/auth/profile`         | Lấy thông tin profile | ✅            |
| PUT    | `/api/auth/profile`         | Cập nhật profile      | ✅            |
| PUT    | `/api/auth/change-password` | Đổi mật khẩu          | ✅            |
| POST   | `/api/auth/forgot-password` | Quên mật khẩu         | ❌            |

### Products Endpoints

| Method | Endpoint                   | Description                          | Auth Required |
| ------ | -------------------------- | ------------------------------------ | ------------- |
| GET    | `/api/products`            | Lấy danh sách sản phẩm (với filters) | ❌            |
| GET    | `/api/products/blanks`     | Chỉ lấy phôi trắng                   | ❌            |
| GET    | `/api/products/ready-made` | Chỉ lấy sản phẩm hoàn chỉnh          | ❌            |
| GET    | `/api/products/featured`   | Sản phẩm nổi bật                     | ❌            |
| GET    | `/api/products/new`        | Sản phẩm mới                         | ❌            |
| GET    | `/api/products/:id`        | Chi tiết sản phẩm                    | ❌            |
| POST   | `/api/products`            | Tạo sản phẩm mới                     | ✅ Admin      |
| PATCH  | `/api/products/:id`        | Cập nhật sản phẩm                    | ✅ Admin      |
| DELETE | `/api/products/:id`        | Xóa sản phẩm                         | ✅ Admin      |

**Query Parameters cho GET /api/products:**

- `search`: Tìm kiếm theo tên/mô tả
- `categoryId`: Lọc theo category
- `minPrice`, `maxPrice`: Lọc theo giá
- `isNew`: Sản phẩm mới
- `isFeatured`: Sản phẩm nổi bật
- `blanksOnly`: Chỉ phôi trắng
- `readyMade`: Chỉ sản phẩm hoàn chỉnh
- `page`, `limit`: Pagination
- `sortBy`, `sortOrder`: Sắp xếp

### Categories Endpoints

| Method | Endpoint                       | Description              | Auth Required |
| ------ | ------------------------------ | ------------------------ | ------------- |
| GET    | `/api/categories`              | Lấy danh sách categories | ❌            |
| GET    | `/api/categories/tree`         | Lấy cây categories       | ❌            |
| GET    | `/api/categories/:id`          | Chi tiết category        | ❌            |
| GET    | `/api/categories/:id/products` | Products của category    | ❌            |
| POST   | `/api/categories`              | Tạo category mới         | ✅ Admin      |
| PATCH  | `/api/categories/:id`          | Cập nhật category        | ✅ Admin      |
| DELETE | `/api/categories/:id`          | Xóa category             | ✅ Admin      |

### Cart Endpoints

| Method | Endpoint                  | Description           | Auth Required |
| ------ | ------------------------- | --------------------- | ------------- |
| GET    | `/api/cart`               | Lấy giỏ hàng          | ✅            |
| GET    | `/api/cart/summary`       | Tóm tắt giỏ hàng      | ✅            |
| POST   | `/api/cart/add`           | Thêm sản phẩm vào giỏ | ✅            |
| PATCH  | `/api/cart/items/:itemId` | Cập nhật số lượng     | ✅            |
| DELETE | `/api/cart/items/:itemId` | Xóa item khỏi giỏ     | ✅            |
| DELETE | `/api/cart/clear`         | Xóa toàn bộ giỏ hàng  | ✅            |
| POST   | `/api/cart/apply-voucher` | Áp dụng voucher       | ✅            |

### Orders Endpoints

| Method | Endpoint                   | Description       | Auth Required |
| ------ | -------------------------- | ----------------- | ------------- |
| POST   | `/api/orders`              | Tạo đơn hàng mới  | ✅            |
| GET    | `/api/orders/my-orders`    | Đơn hàng của user | ✅            |
| GET    | `/api/orders/:id`          | Chi tiết đơn hàng | ✅            |
| GET    | `/api/orders/:id/tracking` | Tracking đơn hàng | ✅            |
| PATCH  | `/api/orders/:id/cancel`   | Hủy đơn hàng      | ✅            |

### Reviews Endpoints

| Method | Endpoint           | Description           | Auth Required |
| ------ | ------------------ | --------------------- | ------------- |
| GET    | `/api/reviews`     | Lấy danh sách reviews | ❌            |
| POST   | `/api/reviews`     | Tạo review mới        | ✅            |
| PATCH  | `/api/reviews/:id` | Cập nhật review       | ✅            |
| DELETE | `/api/reviews/:id` | Xóa review            | ✅            |

### Customizer Endpoints (⭐ Mới)

| Method | Endpoint                          | Description                  | Auth Required |
| ------ | --------------------------------- | ---------------------------- | ------------- |
| POST   | `/api/customizer/save`            | Lưu design đang customize    | ✅            |
| GET    | `/api/customizer/saved`           | Lấy danh sách designs đã lưu | ✅            |
| GET    | `/api/customizer/saved/:id`       | Lấy design đã lưu để edit    | ✅            |
| DELETE | `/api/customizer/saved/:id`       | Xóa design đã lưu            | ✅            |
| POST   | `/api/customizer/calculate-price` | Tính giá khi customize       | ✅            |

### Favorites Endpoints (⭐ Mới)

| Method | Endpoint                             | Description             | Auth Required |
| ------ | ------------------------------------ | ----------------------- | ------------- |
| GET    | `/api/favorites`                     | Lấy danh sách favorites | ✅            |
| POST   | `/api/favorites`                     | Thêm vào favorites      | ✅            |
| DELETE | `/api/favorites/:id`                 | Xóa khỏi favorites      | ✅            |
| DELETE | `/api/favorites?productId=xxx`       | Xóa bằng productId      | ✅            |
| GET    | `/api/favorites/check?productId=xxx` | Kiểm tra đã favorite    | ✅            |

### Rewards Endpoints (⭐ Mới)

| Method | Endpoint                        | Description          | Auth Required |
| ------ | ------------------------------- | -------------------- | ------------- |
| GET    | `/api/rewards/points`           | Số điểm hiện có      | ✅            |
| GET    | `/api/rewards/history`          | Lịch sử tích điểm    | ✅            |
| GET    | `/api/rewards/catalog`          | Catalog rewards      | ✅            |
| POST   | `/api/rewards/redeem/:rewardId` | Đổi điểm lấy voucher | ✅            |

### Vouchers Endpoints (⭐ Mới)

| Method | Endpoint                          | Description           | Auth Required |
| ------ | --------------------------------- | --------------------- | ------------- |
| GET    | `/api/vouchers/validate?code=xxx` | Validate voucher code | ❌            |
| GET    | `/api/vouchers/my-vouchers`       | Vouchers của user     | ✅            |

### Designs Endpoints

| Method | Endpoint                   | Description           | Auth Required |
| ------ | -------------------------- | --------------------- | ------------- |
| GET    | `/api/designs`             | Lấy danh sách designs | ❌            |
| GET    | `/api/designs/trending`    | Trending designs      | ❌            |
| GET    | `/api/designs/:id`         | Chi tiết design       | ❌            |
| POST   | `/api/designs`             | Tạo design mới        | ✅            |
| PATCH  | `/api/designs/:id`         | Cập nhật design       | ✅            |
| PATCH  | `/api/designs/:id/approve` | Duyệt design          | ✅ Admin      |
| PATCH  | `/api/designs/:id/reject`  | Từ chối design        | ✅ Admin      |

### SKU Variants Endpoints

| Method | Endpoint                               | Description              | Auth Required |
| ------ | -------------------------------------- | ------------------------ | ------------- |
| GET    | `/api/sku-variants/product/:productId` | SKU variants của product | ❌            |
| GET    | `/api/sku-variants/:id`                | Chi tiết SKU variant     | ❌            |
| POST   | `/api/sku-variants`                    | Tạo SKU variant          | ✅ Admin      |
| PATCH  | `/api/sku-variants/:id`                | Cập nhật SKU variant     | ✅ Admin      |
| DELETE | `/api/sku-variants/:id`                | Xóa SKU variant          | ✅ Admin      |

### Addresses Endpoints

| Method | Endpoint                         | Description           | Auth Required |
| ------ | -------------------------------- | --------------------- | ------------- |
| GET    | `/api/addresses`                 | Lấy danh sách địa chỉ | ✅            |
| GET    | `/api/addresses/:id`             | Chi tiết địa chỉ      | ✅            |
| POST   | `/api/addresses`                 | Tạo địa chỉ mới       | ✅            |
| PATCH  | `/api/addresses/:id`             | Cập nhật địa chỉ      | ✅            |
| PATCH  | `/api/addresses/:id/set-default` | Đặt làm mặc định      | ✅            |
| DELETE | `/api/addresses/:id`             | Xóa địa chỉ           | ✅            |

### Payment Methods Endpoints

| Method | Endpoint                               | Description                   | Auth Required |
| ------ | -------------------------------------- | ----------------------------- | ------------- |
| GET    | `/api/payment-methods`                 | Lấy danh sách payment methods | ✅            |
| GET    | `/api/payment-methods/:id`             | Chi tiết payment method       | ✅            |
| POST   | `/api/payment-methods`                 | Tạo payment method mới        | ✅            |
| PATCH  | `/api/payment-methods/:id`             | Cập nhật payment method       | ✅            |
| PATCH  | `/api/payment-methods/:id/set-default` | Đặt làm mặc định              | ✅            |
| DELETE | `/api/payment-methods/:id`             | Xóa payment method            | ✅            |

### Shipments Endpoints

| Method | Endpoint                        | Description          | Auth Required |
| ------ | ------------------------------- | -------------------- | ------------- |
| GET    | `/api/shipments/order/:orderId` | Thông tin vận chuyển | ✅            |
| GET    | `/api/shipments/:id/tracking`   | Tracking details     | ✅            |
| POST   | `/api/shipments/:id/tracking`   | Thêm tracking event  | ✅            |

### Users Endpoints

| Method | Endpoint                             | Description               | Auth Required |
| ------ | ------------------------------------ | ------------------------- | ------------- |
| GET    | `/api/users`                         | Lấy danh sách users       | ✅ Admin      |
| GET    | `/api/users/profile`                 | Profile của user hiện tại | ✅            |
| GET    | `/api/users/dashboard/stats`         | Dashboard stats           | ✅            |
| GET    | `/api/users/dashboard/recent-orders` | Recent orders             | ✅            |
| GET    | `/api/users/dashboard/trees-planted` | Số cây đã trồng           | ✅            |
| GET    | `/api/users/:id`                     | Chi tiết user             | ✅ Admin      |
| PATCH  | `/api/users/profile`                 | Cập nhật profile          | ✅            |
| PATCH  | `/api/users/profile/change-password` | Đổi mật khẩu              | ✅            |

### Health Check

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | `/api/`       | Welcome message |
| GET    | `/api/health` | Health check    |

---

## 🔐 Authentication

API sử dụng JWT Bearer token. Thêm header sau vào requests:

```
Authorization: Bearer <your-jwt-token>
```

### Ví dụ với cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Sử dụng token
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <your-token>"
```

---

## 📊 Database Schema

### Core Entities (33 entities)

1. **User** - Người dùng
2. **Product** - Sản phẩm
3. **Category** - Danh mục
4. **Order** - Đơn hàng
5. **OrderItem** - Chi tiết đơn hàng
6. **Cart** - Giỏ hàng
7. **CartItem** - Item trong giỏ hàng
8. **Review** - Đánh giá
9. **Address** - Địa chỉ
10. **PaymentMethod** - Phương thức thanh toán
11. **Payment** - Thanh toán
12. **Shipment** - Vận chuyển
13. **TrackEvent** - Sự kiện tracking
14. **Packaging** - Đóng gói
15. **ReturnRequest** - Yêu cầu đổi trả
16. **ReturnReason** - Lý do đổi trả
17. **Design** - Thiết kế
18. **DesignAsset** - Tài sản design
19. **DesignPlacement** - Vị trí design
20. **PrintMethod** - Phương pháp in
21. **SkuVariant** - Biến thể SKU
22. **Size** - Kích thước
23. **ColorOption** - Tùy chọn màu
24. **Material** - Chất liệu
25. **Stock** - Kho
26. **Employee** - Nhân viên
27. **InvitationCode** - Mã mời
28. **SavedDesign** - Design đã lưu ⭐
29. **Favorite** - Yêu thích ⭐
30. **Voucher** - Voucher ⭐
31. **UserVoucher** - Voucher của user ⭐
32. **RewardPoint** - Điểm thưởng ⭐
33. **RewardCatalog** - Catalog phần thưởng ⭐

---

## 🎯 Mapping với Frontend Pages

Backend đã được mapping đầy đủ với **17 trang** của frontend:

1. ✅ **Home Page** - Featured products, new products, trending designs
2. ✅ **Shop Blanks Page** - Products với blanksOnly filter
3. ✅ **Blank Detail Page** - Product details, SKU variants, reviews
4. ✅ **Design Gallery Page** - Designs list, trending designs
5. ✅ **Design Detail Page** - Design details, favorites
6. ✅ **Customizer Page** - Save/load designs, calculate price ⭐
7. ✅ **Shopping Cart Page** - Cart management, voucher validation
8. ✅ **Checkout Page** - Order creation, addresses, payment methods
9. ✅ **Order Success Page** - Order details, shipment info
10. ✅ **User Dashboard** - Stats, orders, points, vouchers, saved designs ⭐
11. ✅ **Login Page** - Authentication
12. ✅ **Register Page** - User registration
13. ✅ **Forgot Password Page** - Password reset
14. ✅ **About Green Page** - Static content
15. ✅ **Help Page** - Static FAQ
16. ✅ **Contact Page** - Contact form (có thể thêm API sau)
17. ✅ **Admin Dashboard** - Admin management

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 📝 Scripts

```bash
# Development
npm run start:dev          # Start với hot-reload
npm run start:debug      # Start với debug mode

# Production
npm run build            # Build project
npm run start:prod       # Start production server

# Code Quality
npm run format           # Format code với Prettier
npm run lint             # Lint code với ESLint

# Database
npm run seed             # Seed database với sample data
```

---

## 🗄️ Database Seeding

Để seed database với dữ liệu mẫu:

```bash
npm run seed
```

Seeder sẽ tạo:

- Sample users (admin, customers)
- Sample categories
- Sample products
- Sample designs
- Sample SKU variants

---

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t sustainique-backend .

# Run container
docker run -p 5000:5000 --env-file .env sustainique-backend
```

### Environment Variables cho Production

Đảm bảo thiết lập đúng các biến môi trường:

```env
NODE_ENV=production
DB_PASSWORD=<strong-password>
JWT_SECRET=<strong-secret-key>
NEO4J_PASSWORD=<neo4j-password>
CORS_ORIGIN=https://your-frontend-domain.com
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Disable TypeORM synchronize (use migrations)
- [ ] Use strong passwords cho databases
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Setup proper CORS origins
- [ ] Setup logging
- [ ] Setup monitoring
- [ ] Backup database regularly

---

## 📚 API Documentation

### Request/Response Examples

#### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+84123456789"
}
```

#### Create Order

```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "skuId": "uuid",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St",
  "paymentMethodId": "uuid",
  "addressId": "uuid"
}
```

---

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

---

## 📄 License

Dự án này được cấp phép dưới MIT License.

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra logs: `npm run start:dev` sẽ hiển thị errors
2. Kiểm tra database connection
3. Kiểm tra environment variables
4. Tạo issue trên GitHub

---

## 📞 Liên Hệ

- **Email**: support@sustainique.com
- **GitHub**: [Repository URL]

---

**Made with 💚 for the Planet**

© 2024 Sustainique. All rights reserved.
