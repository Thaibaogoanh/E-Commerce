# 🗄️ Database Setup Guide

## 📋 Tổng quan

Dự án sử dụng **2 database**:
- **PostgreSQL**: Lưu trữ tất cả dữ liệu chính (users, products, orders, etc.)
- **Neo4j**: Graph database (đã cấu hình, sẵn sàng sử dụng cho recommendation, graph queries)

## 📁 Cấu trúc thư mục

### `src/migrations/` - Database Migrations
**Mục đích**: Tạo và quản lý schema database (tables, indexes, enums)
- Chạy **một lần** khi setup database mới
- Tạo các bảng, constraints, indexes
- File: `1700000000000-AddErdExtensions.ts`

**Khi nào dùng**:
- Setup database mới
- Thêm/cập nhật schema
- Production deployment

### `src/seeders/` - Database Seeders
**Mục đích**: Chèn dữ liệu mẫu vào database
- Có thể chạy **nhiều lần** (có kiểm tra dữ liệu đã tồn tại)
- Tạo users, products, orders mẫu
- Files:
  - `seed.ts`: Script standalone để chạy seed
  - `auto-seed.ts`: Tự động chạy khi start app (nếu database trống)
  - `sample-data.ts`: Dữ liệu mẫu

**Khi nào dùng**:
- Development: Tạo dữ liệu test
- Demo: Tạo dữ liệu mẫu
- Testing: Reset và seed lại dữ liệu

## 🚀 Cách sử dụng

### Option 1: Setup tự động (Khuyến nghị)
Chạy migrations + seed trong một lệnh:
```bash
npm run db:setup
```

### Option 2: Chạy riêng lẻ

#### Chạy migrations:
```bash
npm run migration:run
```

#### Chạy seed:
```bash
npm run seed:ts
```

### Option 3: Tự động khi start app
Khi chạy `npm run start:dev`, app sẽ:
1. Tự động tạo schema (nếu `synchronize: true` trong development)
2. Tự động seed nếu database trống (qua `auto-seed.ts`)

## ⚙️ Cấu hình

### PostgreSQL (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=mydatabase
```

### Neo4j (.env)
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=mypassword
```

## 📝 Scripts có sẵn

| Script | Mô tả |
|--------|-------|
| `npm run db:setup` | Chạy migrations + seed (nếu database trống) |
| `npm run migration:run` | Chạy tất cả migrations chưa apply |
| `npm run migration:revert` | Revert migration cuối cùng |
| `npm run seed:ts` | Chạy seed (chèn dữ liệu mẫu) |

## 🔄 Workflow khuyến nghị

### Lần đầu setup:
```bash
# 1. Start Docker (PostgreSQL + Neo4j)
docker-compose up -d

# 2. Setup database (migrations + seed)
npm run db:setup

# 3. Start backend
npm run start:dev
```

### Development hàng ngày:
```bash
# Chỉ cần start app, migrations và seed tự động
npm run start:dev
```

### Khi có migration mới:
```bash
# Chạy migration mới
npm run migration:run
```

## ❓ Tại sao có 2 thư mục?

- **Migrations** (`src/migrations/`): Quản lý **cấu trúc** database (schema)
  - Tạo tables, columns, indexes
  - Version control cho database structure
  - Chạy một lần, không thể revert dễ dàng

- **Seeders** (`src/seeders/`): Quản lý **dữ liệu** database
  - Chèn dữ liệu mẫu
  - Có thể chạy lại nhiều lần
  - Dễ dàng reset và seed lại

**Tách biệt để**:
- Dễ quản lý: Schema vs Data
- Linh hoạt: Có thể seed lại mà không cần migrate
- An toàn: Migrations không bị ảnh hưởng bởi seed data

## 🐛 Troubleshooting

### Lỗi: "Migration already exists"
- Migration đã được apply, bỏ qua lỗi này

### Lỗi: "Table already exists"
- Database đã có schema, có thể bỏ qua hoặc dùng `synchronize: false`

### Muốn reset database:
```bash
# Xóa database và tạo lại
# (Cẩn thận: Mất hết dữ liệu!)
npm run db:reset
```

## 📚 Tài liệu thêm

- [TypeORM Migrations](https://typeorm.io/migrations)
- [NestJS Database](https://docs.nestjs.com/techniques/database)


