# 🚀 Backend - NestJS API Server

Hướng dẫn hoàn chỉnh setup, chạy, và sử dụng tất cả API endpoints của backend.

**📊 Status: PRODUCTION READY** | **✅ 0 Errors** | **106+ API Endpoints** | **45+ Database Entities**

👉 **[View Project Summary](./PROJECT_SUMMARY.md)** - Complete overview of features and documentation

---

## 📋 Mục Lục

1. [Quick Start](#-quick-start)
2. [Setup Toàn Bộ](#-setup-toàn-bộ)
3. [Database](#-database)
4. [API Endpoints](#-api-endpoints)
5. [API Flow & Documentation](#-api-flow--documentation)
6. [Services & Features](#-services--features)
7. [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Setup database
npm run db:setup    # First time setup
# OR
npm run db:reset    # Reset & reseed data

# 4. Run development server
npm run start:dev

# 5. Server running at http://localhost:5000
```

---

## 🔧 Setup Toàn Bộ

### 1. Install Node.js & npm

**Required:**
- Node.js 18+ (https://nodejs.org/)
- npm 9+

**Check versions:**
```bash
node --version   # Should be v18.x or higher
npm --version    # Should be 9.x or higher
```

### 2. Install Dependencies

```bash
cd retail-store-nestjs
npm install
```

**What gets installed:**
- NestJS framework
- TypeORM (database)
- PostgreSQL driver
- JWT authentication
- Email service (Nodemailer)
- Stripe API integration
- Plus 50+ other packages

### 3. Setup Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

**Edit `.env` with your values:**

```env
# ================== DATABASE ==================
DB_HOST=localhost                    # PostgreSQL host
DB_PORT=5432                        # PostgreSQL port
DB_USER=postgres                    # PostgreSQL user
DB_PASSWORD=your_password           # PostgreSQL password
DB_DATABASE=tmdt_db                 # Database name

# ================== APPLICATION ==================
NODE_ENV=development                # development or production
APP_PORT=5000                       # Backend server port
JWT_SECRET=your_secret_key_here     # JWT signing key (generate random)

# ================== FRONTEND ==================
FRONTEND_URL=http://localhost:3000  # Frontend URL
CORS_ORIGIN=http://localhost:3000   # CORS allowed origins

# ================== EMAIL (Optional) ==================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourapp.com

# ================== PAYMENT (Optional) ==================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Setup Database

#### Option A: PostgreSQL Locally (Windows)

**Download & Install:**
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15+
3. Run installer
4. Remember your password!

**Create database:**
```bash
# Open PowerShell
psql -U postgres
# Enter password

# In psql:
CREATE DATABASE tmdt_db;
\q  # Exit
```

#### Option B: PostgreSQL with Docker

**Install Docker Desktop** (https://www.docker.com/)

**Run PostgreSQL:**
```bash
docker run -d \
  --name postgres-tmdt \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=tmdt_db \
  -p 5432:5432 \
  postgres:15
```

#### Option C: Use docker-compose (PostgreSQL + Neo4j + pgAdmin)

**Best option - runs everything needed:**

```bash
cd ..  # Go to TMĐT root directory
docker-compose up -d
# Waits 30 seconds for services to start
```

**What this starts:**
- ✅ **PostgreSQL** (port 5432) - Main database
- ✅ **pgAdmin** (port 5050) - Database UI (admin/admin)
- ✅ **Neo4j** (port 7687, 7474) - Graph database for AI recommendations

**Access services:**
- pgAdmin: http://localhost:5050
- Neo4j Browser: http://localhost:7474

**Add to .env file:**
```env
# From docker-compose.yml
DB_HOST=postgres
DB_USER=myuser
DB_PASSWORD=mypassword
DB_DATABASE=mydatabase

# Neo4j config
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=mypassword
```

### 5. Run Database Setup

**First time only:**
```bash
npm run db:setup
```

This will:
- ✅ Create all tables
- ✅ Create relationships
- ✅ Seed sample data
- ✅ Create indexes

**Reset database (deletes all data):**
```bash
npm run db:reset
```

**Check if it worked:**
```bash
psql -h localhost -U postgres -d tmdt_db
# In psql:
\dt     # List all tables
\q      # Exit
```

### 6. Start Development Server

```bash
npm run start:dev
```

**You should see:**
```
[Nest] 12345   - 12/22/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345   - 12/22/2025, 10:30:02 AM     LOG [InstanceLoader] AppModule dependencies initialized +180ms
[Nest] 12345   - 12/22/2025, 10:30:02 AM     LOG [RoutesResolver] AppController {/}: GET
...
[Nest] 12345   - 12/22/2025, 10:30:02 AM     LOG [NestApplication] Nest application successfully started +250ms
```

**Server is running at:** http://localhost:5000

### 7. (Optional) Enable Neo4j for AI Recommendations

```bash
# Start Neo4j container (from project root)
docker-compose up -d neo4j

# Verify Neo4j is running
docker ps | grep neo4j

# Access Neo4j Browser
# http://localhost:7474 (login: neo4j / mypassword)

# Restart backend to sync data
npm run db:reset  # Auto-syncs products to Neo4j
npm run start:dev
```

Check logs for Neo4j status:
```
✅ Neo4j connection successful    # Neo4j is working
⚠️ Neo4j unavailable              # Neo4j not running (optional, app still works)
```

---

## 🗄️ Database

### Database Structure

```
Products
├── Product (items for sale)
├── SkuVariant (color/size combinations)
├── Stock (inventory tracking)
└── Price (pricing history)

Users
├── User (customer/admin accounts)
├── Address (shipping addresses)
└── UserRole (permissions)

Orders
├── Order (purchase records)
├── OrderItem (items in order)
├── Shipment (delivery tracking)
└── Return (return requests)

Content
├── Design (custom designs)
├── DesignTemplate (template gallery)
├── Review (product reviews)
└── Favorite (user favorites)

Admin
├── Category (product categories)
├── Asset (uploaded files)
├── AssetDisposal (deleted files)
└── Employee (staff accounts)

Other
├── Cart & CartItem
├── Voucher
├── Payment
└── ReturnReason
```

### Database Entity Relationships

**Product → SkuVariant → Stock**
```
One Product has Many SkuVariants
One SkuVariant has Many Stocks
```

**User → Order → OrderItem**
```
One User has Many Orders
One Order has Many OrderItems
```

**SkuVariant ← OrderItem**
```
Many OrderItems reference One SkuVariant
```

### Common Database Queries

**Connect to database:**
```bash
psql -h localhost -U postgres -d tmdt_db
```

**View all tables:**
```sql
\dt
```

**Count products:**
```sql
SELECT COUNT(*) FROM products;
```

**View product with SKU variants:**
```sql
SELECT p.id, p.name, COUNT(sv.id) as variant_count
FROM products p
LEFT JOIN sku_variants sv ON p.id = sv.product_id
GROUP BY p.id, p.name;
```

**Check orders:**
```sql
SELECT o.id, u.email, COUNT(oi.id) as item_count, o.total_amount
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.email;
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check

**GET** `/health`
```bash
curl http://localhost:5000/api/health
```
**Response:**
```json
{ "status": "ok" }
```

---

### 👥 Authentication

#### Register
**POST** `/auth/register`
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```
**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John"
  }
}
```

#### Login
**POST** `/auth/login`
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Get Current User
**GET** `/auth/me`
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

---

## 📚 API Flow & Documentation

### Complete API Documentation

📖 **See [API_FLOW.md](./API_FLOW.md)** for:
- ✅ **All 100+ API endpoints** with request/response examples
- ✅ **Complete customer journey** - from browsing to payment to delivery
- ✅ **Authentication** - JWT token usage
- ✅ **Error handling** - status codes and error messages
- ✅ **API grouping** by feature (Auth, Products, Cart, Orders, Payments, etc.)
- ✅ **All 28 controllers** with detailed endpoints

🔄 **See [SEQUENCE_DIAGRAM.md](./SEQUENCE_DIAGRAM.md)** for:
- ✅ **Flow diagrams** - Visual representation of API calls
- ✅ **User journeys** - Step-by-step customer interactions
- ✅ **Sequence diagrams** - System interactions between Client/Server/External Services
- ✅ **Admin workflows** - Dashboard & order management
- ✅ **Common scenarios** - First-time buyer, customization, returning customer

### Quick API Reference by Feature

---

### 📦 Products

#### Get All Products
**GET** `/products`
```bash
curl http://localhost:5000/api/products
```

**Query Parameters:**
```bash
# Pagination
?page=1&limit=10

# Filter by category
?categoryId=uuid

# Search
?search=shirt

# Sort
?sortBy=price&order=asc
```

#### Get Single Product
**GET** `/products/:id`
```bash
curl http://localhost:5000/api/products/uuid
```

**Response includes:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "...",
  "price": 100000,
  "colors": [...],
  "skuVariants": [
    {
      "id": "uuid",
      "productId": "uuid",
      "colorCode": "BLACK",
      "sizeCode": "M",
      "stock": 50
    }
  ],
  "reviews": [...],
  "images": [...]
}
```

#### Create Product (Admin)
**POST** `/products`
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Description",
    "basePrice": 100000,
    "categoryId": "uuid"
  }'
```

---

### 🎨 Customizer

#### Calculate Price
**POST** `/customizer/calculate-price`
```bash
curl -X POST http://localhost:5000/api/customizer/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid",
    "colorCode": "BLACK",
    "sizeCode": "M",
    "designData": {
      "hasCustomDesign": true,
      "designType": "embroidery"
    }
  }'
```

**Response:**
```json
{
  "basePrice": 100000,
  "customizationCost": 50000,
  "totalPrice": 150000,
  "currency": "VND"
}
```

#### Add to Cart
**POST** `/customizer/add-to-cart`
```bash
curl -X POST http://localhost:5000/api/customizer/add-to-cart \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid",
    "quantity": 1,
    "colorCode": "BLACK",
    "sizeCode": "M",
    "customizationData": {
      "designFile": "url",
      "designType": "print"
    }
  }'
```

#### Save Design
**POST** `/customizer/save-design`
```bash
curl -X POST http://localhost:5000/api/customizer/save-design \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Design",
    "productId": "uuid",
    "designData": {...},
    "isPublic": false
  }'
```

---

### 🛒 Shopping Cart

#### Get Cart
**GET** `/cart`
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/cart
```

#### Add Item
**POST** `/cart/items`
```bash
curl -X POST http://localhost:5000/api/cart/items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skuVariantId": "uuid",
    "quantity": 2
  }'
```

#### Update Item Quantity
**PATCH** `/cart/items/:itemId`
```bash
curl -X PATCH http://localhost:5000/api/cart/items/uuid \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 5 }'
```

#### Remove Item
**DELETE** `/cart/items/:itemId`
```bash
curl -X DELETE http://localhost:5000/api/cart/items/uuid \
  -H "Authorization: Bearer TOKEN"
```

#### Clear Cart
**DELETE** `/cart`
```bash
curl -X DELETE http://localhost:5000/api/cart \
  -H "Authorization: Bearer TOKEN"
```

---

### 📦 Orders

#### Create Order
**POST** `/orders`
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddressId": "uuid",
    "paymentMethod": "stripe",
    "notes": "Gift wrapping requested"
  }'
```

#### Get User Orders
**GET** `/orders`
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/orders
```

#### Get Single Order
**GET** `/orders/:id`
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/orders/uuid
```

#### Update Order Status (Admin)
**PATCH** `/orders/:id/status`
```bash
curl -X PATCH http://localhost:5000/api/orders/uuid/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "shipped" }'
```

---

### 🚚 Shipments

#### Get Shipment Tracking
**GET** `/shipments/:orderId`
```bash
curl http://localhost:5000/api/shipments/order-uuid
```

#### Update Tracking (Admin)
**PATCH** `/shipments/:id`
```bash
curl -X PATCH http://localhost:5000/api/shipments/uuid \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_transit",
    "trackingNumber": "VN123456789"
  }'
```

---

### ⭐ Reviews & Ratings

#### Get Product Reviews
**GET** `/reviews/product/:productId`
```bash
curl http://localhost:5000/api/reviews/product/uuid
```

#### Create Review
**POST** `/reviews`
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid",
    "orderId": "uuid",
    "rating": 5,
    "title": "Great product!",
    "content": "Very satisfied with quality"
  }'
```

---

### 💳 Payments

#### Create Payment Intent
**POST** `/payments/create-intent`
```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid",
    "amount": 150000,
    "currency": "VND"
  }'
```

#### Confirm Payment
**POST** `/payments/confirm`
```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_...",
    "orderId": "uuid"
  }'
```

---

### 👤 User Profile

#### Get Profile
**GET** `/users/profile`
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/users/profile
```

#### Update Profile
**PATCH** `/users/profile`
```bash
curl -X PATCH http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "New Name",
    "phone": "0912345678"
  }'
```

#### Change Password
**POST** `/users/change-password`
```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "old123",
    "newPassword": "new456"
  }'
```

---

### 📍 Addresses

#### Get Addresses
**GET** `/addresses`
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/addresses
```

#### Create Address
**POST** `/addresses`
```bash
curl -X POST http://localhost:5000/api/addresses \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Home",
    "line1": "123 Main St",
    "line2": "Apt 4",
    "state": "TP. HCM",
    "zip": "700000",
    "country": "VN"
  }'
```

#### Update Address
**PATCH** `/addresses/:id`
```bash
curl -X PATCH http://localhost:5000/api/addresses/uuid \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "line1": "456 New St"
  }'
```

#### Set Default Address
**PATCH** `/addresses/:id/set-default`
```bash
curl -X PATCH http://localhost:5000/api/addresses/uuid/set-default \
  -H "Authorization: Bearer TOKEN"
```

#### Delete Address
**DELETE** `/addresses/:id`
```bash
curl -X DELETE http://localhost:5000/api/addresses/uuid \
  -H "Authorization: Bearer TOKEN"
```

---

### 📊 Admin Endpoints

#### Get Dashboard Stats
**GET** `/admin/dashboard`
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/dashboard
```

**Returns:**
```json
{
  "totalOrders": 150,
  "totalRevenue": 50000000,
  "totalCustomers": 200,
  "ordersThisMonth": 25,
  "revenueThisMonth": 5000000,
  "topProducts": [...]
}
```

#### Get All Users (Admin)
**GET** `/admin/users`
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/users
```

#### Get All Orders (Admin)
**GET** `/admin/orders`
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/orders
```

---

## 🛠️ Services & Features

### Authentication Service
- JWT token generation
- Password hashing (bcrypt)
- Token validation
- Role-based access control

### Product Service
- Full CRUD operations
- SKU variant management
- Pricing calculations
- Stock tracking

### Order Service
- Order creation & management
- Order status tracking
- Order history
- Order analytics

### Payment Service
- Stripe integration
- Payment intent creation
- Payment confirmation
- Webhook handling

### Email Service
- Order confirmations
- Shipping notifications
- Password reset emails
- Welcome emails
- Handlebars template rendering

### Customizer Service
- Design saving
- Custom pricing calculation
- Design template gallery
- Color & size mapping

### User Service
- User registration
- Profile management
- Password changes
- Address management

---

## 🔍 Debugging & Logging

### View Logs

**While running:**
```bash
npm run start:dev
# Logs appear in console
```

**Save logs to file:**
```bash
npm run start:dev > logs.txt 2>&1
```

### Enable Debug Mode

Add to `.env`:
```env
DEBUG=*
LOG_LEVEL=debug
```

### Check Database Logs

```bash
# For PostgreSQL
SELECT * FROM pg_stat_statements;

# View recent queries
SELECT query, calls, total_time FROM pg_stat_statements
ORDER BY total_time DESC LIMIT 10;
```

---

## 📦 Available Scripts

```bash
npm run start          # Production mode
npm run start:dev      # Development mode with hot reload
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run integration tests
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run db:setup       # Setup database
npm run db:reset       # Reset & reseed database
npm run db:migrate     # Run migrations
```

---

## 🚀 Build & Deploy

### Build for Production

```bash
npm run build
```

**Creates:**
- `dist/` folder with compiled JavaScript
- Optimized for deployment

### Run Production Build

```bash
NODE_ENV=production npm run start
```

### Docker Deployment

```bash
docker build -t tmdt-backend .
docker run -p 5000:5000 --env-file .env tmdt-backend
```

---

## 🆘 Troubleshooting

### Port 5000 Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
APP_PORT=5001 npm run start:dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d tmdt_db

# Check .env credentials
# Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

# Restart PostgreSQL
sudo systemctl restart postgresql  # Linux/Mac
# Or restart Docker container
```

### JWT Token Expired
```bash
# Generate new token by logging in again
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Module Not Found Error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### TypeScript Compilation Error
```bash
# Check for type errors
npm run build

# Fix ESLint issues
npm run format

# Force rebuild
rm -rf dist
npm run build
```

### Neo4j Connection Issues

**Problem:** `Neo4j unavailable. Recommendations will be disabled.`

**Solution 1: Start Neo4j with docker-compose**
```bash
# Run from project root (where docker-compose.yml is)
docker-compose up -d neo4j

# Check if running
docker ps | grep neo4j

# View logs
docker logs local_neo4j
```

**Solution 2: Reset Neo4j password**
```bash
# Stop container
docker stop local_neo4j

# Remove and recreate
docker rm local_neo4j
docker-compose up -d neo4j

# New password: mypassword (from docker-compose.yml)
# Update .env: NEO4J_PASSWORD=mypassword
```

**Solution 3: Access Neo4j Browser**
```
http://localhost:7474
Username: neo4j
Password: mypassword (from docker-compose.yml)
```

**Solution 4: Check connection from backend**
```bash
# Logs should show:
npm run start:dev | grep -i neo4j

# Should see:
# ✅ Neo4j connection successful
# OR (if Neo4j not running - that's OK):
# ⚠️ Neo4j unavailable. Recommendations will be disabled.
```

**Note:** Neo4j is optional. If not running:
- ✅ Main app still works fine
- ❌ AI recommendations will be disabled
- All other features work normally

**To fully enable Neo4j:**
1. Start: `docker-compose up -d neo4j`
2. Add to .env: `NEO4J_PASSWORD=mypassword`
3. Run: `npm run db:reset` (auto-syncs data)
4. Restart: `npm run start:dev`

---

## 📞 API Testing Tools

### cURL (Command Line)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Postman (GUI)
1. Download Postman (https://www.postman.com/)
2. Import API collection
3. Set environment variables
4. Test endpoints

### REST Client VSCode Extension
Create `.http` file:
```
### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Get Products
GET http://localhost:5000/api/products
```

---

## 🎓 Code Structure

```
src/
├── app.module.ts              # Main module
├── app.controller.ts          # Main controller
├── main.ts                    # Entry point
│
├── modules/                   # Feature modules
│   ├── auth/                 # Authentication
│   ├── products/             # Products
│   ├── orders/               # Orders
│   ├── users/                # User management
│   ├── customizer/           # Design customization
│   ├── payments/             # Payment processing
│   ├── addresses/            # Address management
│   ├── shipments/            # Shipment tracking
│   ├── reviews/              # Product reviews
│   ├── cart/                 # Shopping cart
│   └── admin/                # Admin functions
│
├── entities/                  # Database models (38 files)
│   ├── product.entity.ts
│   ├── order.entity.ts
│   ├── user.entity.ts
│   └── ... (35 more)
│
├── dto/                      # Data transfer objects
│   ├── auth.dto.ts
│   ├── product.dto.ts
│   ├── order.dto.ts
│   └── ... (6 more)
│
├── guards/                   # Authentication guards
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
│
├── services/                 # Business logic
│   ├── email.service.ts      # Email notifications
│   └── ... (others in modules)
│
├── seeders/                  # Database seeding
│   └── sample-data-enhanced.ts
│
├── config/                   # Configuration
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── stripe.config.ts
│
└── templates/                # Email templates
    ├── order-confirmation.html
    ├── shipping-notification.html
    ├── password-reset.html
    └── welcome.html
```

---

## ✨ Key Features

✅ Full e-commerce platform  
✅ User authentication & authorization  
✅ Product catalog with variants  
✅ Shopping cart system  
✅ Order management  
✅ Payment integration (VNPay)  
✅ Email notifications  
✅ Design customization  
✅ Product reviews  
✅ Admin dashboard  
✅ User profile management  
✅ Address management  
✅ Order tracking & shipments  
✅ AI Recommendations (Neo4j Graph Database)  
✅ Frequently bought together suggestions  

---

## 📝 Notes

    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: alice@example.com / user1pass');
    console.log('   User: bob@example.com / user2pass');
    console.log('   User: charlie@example.com / user3pass');
- All passwords hashed with bcrypt
- JWT tokens expire after 24 hours
- Stripe keys needed for payment (optional for development)
- Email service optional (gracefully skipped if not configured)

---

**Last Updated:** December 22, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready

