import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Packaging } from '../entities/packaging.entity';
import { ReturnReason } from '../entities/return-reason.entity';
import { Employee, EmployeeRole } from '../entities/employee.entity';
import { Size } from '../entities/size.entity';
import { Material } from '../entities/material.entity';
import { PrintMethod } from '../entities/print-method.entity';
import { Asset } from '../entities/asset.entity';
import { AssetDisposal } from '../entities/asset-disposal.entity';
import { ColorOption } from '../entities/color-option.entity';
import { SkuVariant } from '../entities/sku-variant.entity';
import { Stock } from '../entities/stock.entity';
import {
  StockMovement,
  StockMovementType,
} from '../entities/stock-movement.entity';
import { Shipment, ShipmentStatus } from '../entities/shipment.entity';
import { ShipmentItem } from '../entities/shipment-item.entity';
import { Address } from '../entities/address.entity';
import { Design, DesignStatus, LicenseType } from '../entities/design.entity';
import * as bcrypt from 'bcryptjs';

// Fixed UUIDs for consistent data
const USER_ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const USER_ALICE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const USER_BOB_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const USER_CHARLIE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';

const CAT_SHIRTS_ID = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';
const CAT_JEANS_ID = '2c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bee';
const CAT_DRESSES_ID = '3d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bef';
const CAT_JACKETS_ID = '4e9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bf0';
const CAT_ACCESSORIES_ID = '5f9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bf1';
const CAT_SPORTSWEAR_ID = '6a9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bf2';

const PROD_SHIRT_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000001';
const PROD_FASHION_SHIRT_2_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000002';
const PROD_TSHIRT_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000003';
const PROD_FASHION_JEAN_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000004';
const PROD_FASHION_JEAN_2_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000005';
const PROD_KAKI_SHORTS_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000006';
const PROD_FASHION_DRESS_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000007';
const PROD_FASHION_DRESS_2_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000008';
const PROD_FASHION_JACKET_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000009';
const PROD_FASHION_JACKET_2_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000010';
const PROD_FASHION_HAT_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000011';
const PROD_FASHION_BAG_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000012';
const PROD_SPORT_SHIRT_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000013';
const PROD_SPORT_SHORTS_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000014';
const PROD_LINEN_SHIRT_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000015';
const PROD_GRAPHIC_TSHIRT_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000016';
const PROD_JEAN_RELAXED_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000017';

const REVIEW_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000021';
const REVIEW_2_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000022';
const REVIEW_3_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000023';
const REVIEW_4_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000024';
const REVIEW_5_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000025';
const REVIEW_6_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000026';
const REVIEW_7_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000027';
const REVIEW_8_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000028';

const ORDER_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000031';
const ORDER_2_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000032';
const ORDER_3_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000033';
const ORDER_4_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000034';

const ORDER_ITEM_1_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000041';
const ORDER_ITEM_2_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000042';
const ORDER_ITEM_3_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000043';
const ORDER_ITEM_4_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000044';
const ORDER_ITEM_5_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000045';
const ORDER_ITEM_6_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000046';
const ORDER_ITEM_7_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000047';
const ORDER_ITEM_8_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000048';
const ORDER_ITEM_9_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000049';
const ORDER_ITEM_10_ID = 'a0eebc99-9c0b-4ef8-bb6d-000000000050';

export async function seedDatabase(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    await dataSource.query('DELETE FROM cart_items');
    await dataSource.query('DELETE FROM carts');
    await dataSource.query('DELETE FROM order_items');
    await dataSource.query('DELETE FROM orders');
    await dataSource.query('DELETE FROM reviews');
    await dataSource.query('DELETE FROM designs');
    await dataSource.query('DELETE FROM products');
    await dataSource.query('DELETE FROM categories');
    await dataSource.query('DELETE FROM packagings');
    await dataSource.query('DELETE FROM return_reasons');
    await dataSource.query('DELETE FROM employees');
    await dataSource.query('DELETE FROM sizes');
    await dataSource.query('DELETE FROM materials');
    await dataSource.query('DELETE FROM print_methods');
    await dataSource.query('DELETE FROM color_options');
    await dataSource.query('DELETE FROM stocks');
    await dataSource.query('DELETE FROM shipment_items');
    await dataSource.query('DELETE FROM shipments');
    await dataSource.query('DELETE FROM addresses');
    await dataSource.query('DELETE FROM users');

    // Hash passwords
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordUser1 = await bcrypt.hash('user1pass', 10);
    const hashedPasswordUser2 = await bcrypt.hash('user2pass', 10);
    const hashedPasswordUser3 = await bcrypt.hash('user3pass', 10);

    // Create users
    const users = [
      {
        UserID: USER_ADMIN_ID,
        full_name: 'Admin User',
        email: 'admin@example.com',
        password_hash: hashedPasswordAdmin,
        role: UserRole.ADMIN,
        phone: '0123456789',
        image: 'https://placehold.co/150x150/7F7F7F/FFFFFF&text=Admin',
        is_active: true,
      },
      {
        UserID: USER_ALICE_ID,
        full_name: 'Alice Wonderland',
        email: 'alice@example.com',
        password_hash: hashedPasswordUser1,
        role: UserRole.USER,
        phone: '0987654321',
        image: 'https://placehold.co/150x150/FFC0CB/000000&text=Alice',
        is_active: true,
      },
      {
        UserID: USER_BOB_ID,
        full_name: 'Bob The Builder',
        email: 'bob@example.com',
        password_hash: hashedPasswordUser2,
        role: UserRole.USER,
        phone: '0912345678',
        image: 'https://placehold.co/150x150/ADD8E6/000000&text=Bob',
        is_active: true,
      },
      {
        UserID: USER_CHARLIE_ID,
        full_name: 'Charlie Brown',
        email: 'charlie@example.com',
        password_hash: hashedPasswordUser3,
        role: UserRole.USER,
        phone: '0923456789',
        image: 'https://placehold.co/150x150/FFFF00/000000&text=Charlie',
        is_active: true,
      },
    ];

    await dataSource.getRepository(User).save(users);

    // Create categories
    const categories = [
      {
        id: CAT_SHIRTS_ID,
        name: 'Áo sơ mi & Áo thun',
        description: 'Áo sơ mi, áo thun nam nữ đa dạng kiểu dáng.',
        image: 'https://placehold.co/300x200/F0E68C/000000&text=Ao+So+Mi',
        isActive: true,
      },
      {
        id: CAT_JEANS_ID,
        name: 'Quần Jeans & Kaki',
        description: 'Quần jeans, quần kaki thời trang, bền đẹp.',
        image: 'https://placehold.co/300x200/B0E0E6/000000&text=Quan+Jeans',
        isActive: true,
      },
      {
        id: CAT_DRESSES_ID,
        name: 'Váy Đầm & Chân váy',
        description: 'Váy đầm dự tiệc, dạo phố, công sở thanh lịch.',
        image: 'https://placehold.co/300x200/FFB6C1/000000&text=Vay+Dam',
        isActive: true,
      },
      {
        id: CAT_JACKETS_ID,
        name: 'Áo Khoác',
        description: 'Áo khoác giữ ấm, chống nắng và thời trang.',
        image: 'https://placehold.co/300x200/D3D3D3/000000&text=Ao+Khoac',
        isActive: true,
      },
      {
        id: CAT_ACCESSORIES_ID,
        name: 'Phụ kiện Thời trang',
        description: 'Mũ, túi, thắt lưng, trang sức.',
        image: 'https://placehold.co/300x200/FFE4B5/000000&text=Phu+Kien',
        isActive: true,
      },
      {
        id: CAT_SPORTSWEAR_ID,
        name: 'Đồ Thể Thao',
        description: 'Quần áo và phụ kiện thể thao.',
        image: 'https://placehold.co/300x200/90EE90/000000&text=Do+The+Thao',
        isActive: true,
      },
    ];

    await dataSource.getRepository(Category).save(categories);

    // Seed sizes
    const sizes = [
      { SizeCode: 'S', chest_len: 48, length_len: 68 },
      { SizeCode: 'M', chest_len: 52, length_len: 70 },
      { SizeCode: 'L', chest_len: 56, length_len: 72 },
      { SizeCode: 'XL', chest_len: 60, length_len: 74 },
    ];
    await dataSource.getRepository(Size).save(sizes);

    // Seed materials
    const materials = [
      {
        name: 'Organic Cotton',
        composition: '100% Cotton',
        gsm: 180,
        stretchable: false,
        care: 'Cold wash',
      },
      {
        name: 'Recycled Polyester',
        composition: '100% Recycled Polyester',
        gsm: 160,
        stretchable: true,
        care: 'Machine wash cold',
      },
    ];
    await dataSource.getRepository(Material).save(materials);

    // Seed print methods
    const printMethods = [
      {
        name: 'DTG',
        description: 'Direct to Garment',
        notes: 'Best for small runs',
      },
      {
        name: 'Screen',
        description: 'Screen Printing',
        notes: 'Best for bulk',
      },
    ];
    await dataSource.getRepository(PrintMethod).save(printMethods);

    // Seed color options
    const colorOptions = [
      { ColorCode: 'BLACK', name: 'Black', hex: '#000000', is_active: true },
      { ColorCode: 'WHITE', name: 'White', hex: '#FFFFFF', is_active: true },
    ];
    await dataSource.getRepository(ColorOption).save(colorOptions);

    // Create products
    const products = [
      // Shirts & T-shirts
      {
        id: PROD_SHIRT_1_ID,
        title: 'Áo Sơ Mi Lụa Cao Cấp Trắng',
        name: 'Áo Sơ Mi Lụa Trắng',
        description: 'Chất liệu lụa mềm mại, thoáng mát.',
        price: 750000,
        stock: 50,
        categoryId: CAT_SHIRTS_ID,
        image:
          'https://cdn.kkfashion.vn/18179-home_default/ao-so-mi-nu-cong-so-basic-tay-dai-asm11-22.jpg',
        images: [
          'https://cdn.kkfashion.vn/18179-home_default/ao-so-mi-nu-cong-so-basic-tay-dai-asm11-22.jpg',
        ],
        averageRating: 0,
        numReviews: 0,
        isNew: false,
        isFeatured: true,
        isActive: true,
        quantity: 50,
      },
      {
        id: PROD_FASHION_SHIRT_2_ID,
        title: 'Áo Sơ Mi Kẻ Caro Năng Động Xanh',
        name: 'Áo Sơ Mi Kẻ Caro Xanh',
        description: 'Họa tiết kẻ caro trẻ trung.',
        price: 480000,
        stock: 60,
        categoryId: CAT_SHIRTS_ID,
        image:
          'https://salt.tikicdn.com/cache/w1200/ts/product/b0/39/86/7595f7ce0f4c89388adbd6c6e11897d6.jpg',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 60,
      },
      {
        id: PROD_TSHIRT_1_ID,
        title: 'Áo Thun Cotton Trơn Basic Unisex Đen',
        name: 'Áo Thun Cotton Đen',
        description: 'Áo thun cotton 100%, màu đen basic.',
        price: 200000,
        stock: 100,
        categoryId: CAT_SHIRTS_ID,
        image: 'https://placehold.co/600x400/333333/FFFFFF&text=Ao+Thun+Den',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: true,
        isActive: true,
        quantity: 100,
      },
      {
        id: PROD_LINEN_SHIRT_ID,
        title: 'Áo Sơ Mi Linen Tay Ngắn Trắng',
        name: 'Áo Sơ Mi Linen Trắng',
        description: 'Chất liệu linen thoáng mát, tay ngắn.',
        price: 520000,
        stock: 40,
        categoryId: CAT_SHIRTS_ID,
        image: 'https://placehold.co/600x400/F5F5F5/000000&text=Ao+Linen',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 40,
      },
      {
        id: PROD_GRAPHIC_TSHIRT_ID,
        title: 'Áo Thun Cotton In Họa Tiết Cool',
        name: 'Áo Thun Họa Tiết Cool',
        description: 'Áo thun cotton, in họa tiết độc đáo.',
        price: 220000,
        stock: 80,
        categoryId: CAT_SHIRTS_ID,
        image: 'https://placehold.co/600x400/C0C0C0/000000&text=Ao+Graphic',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 80,
      },
      // Jeans & Kaki
      {
        id: PROD_FASHION_JEAN_1_ID,
        title: 'Quần Jeans Nữ Skinny Co Giãn Xanh Đậm',
        name: 'Quần Jeans Nữ Skinny',
        description: 'Form skinny tôn dáng.',
        price: 650000,
        stock: 45,
        categoryId: CAT_JEANS_ID,
        image:
          'https://th.bing.com/th/id/OIP.vamjwH5nDcOFIMFuM55TSAHaLG?rs=1&pid=ImgDetMain',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: false,
        isFeatured: true,
        isActive: true,
        quantity: 45,
      },
      {
        id: PROD_FASHION_JEAN_2_ID,
        title: 'Quần Jeans Nam Slim Fit Cổ Điển Đen',
        name: 'Quần Jeans Nam Slim Fit',
        description: 'Kiểu dáng slim fit hiện đại.',
        price: 720000,
        stock: 30,
        categoryId: CAT_JEANS_ID,
        image:
          'https://th.bing.com/th/id/OIP.Uo-e-md1Bt2IXxic8EG5rwHaJ4?rs=1&pid=ImgDetMain',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 30,
      },
      {
        id: PROD_JEAN_RELAXED_ID,
        title: 'Quần Jeans Nam Relaxed Fit Xanh Nhạt',
        name: 'Quần Jeans Nam Relaxed',
        description: 'Form relaxed thoải mái, màu xanh nhạt.',
        price: 680000,
        stock: 35,
        categoryId: CAT_JEANS_ID,
        image: 'https://placehold.co/600x400/ADD8E6/000000&text=Jean+Relaxed',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 35,
      },
      {
        id: PROD_KAKI_SHORTS_ID,
        title: 'Quần Short Kaki Nam Beige',
        name: 'Quần Short Kaki Beige',
        description: 'Quần short kaki nam màu beige.',
        price: 350000,
        stock: 70,
        categoryId: CAT_JEANS_ID,
        image: 'https://placehold.co/600x400/F5F5DC/000000&text=Short+Kaki',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 70,
      },
      // Dresses
      {
        id: PROD_FASHION_DRESS_1_ID,
        title: 'Váy Hoa Nhí Vintage Mùa Hè Vàng',
        name: 'Váy Hoa Nhí Vàng',
        description: 'Họa tiết hoa nhí dễ thương.',
        price: 850000,
        stock: 25,
        categoryId: CAT_DRESSES_ID,
        image:
          'https://th.bing.com/th/id/OIP.hpyj1oQnc7ACCrwv-BV90AHaJ4?rs=1&pid=ImgDetMain',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: false,
        isFeatured: true,
        isActive: true,
        quantity: 25,
      },
      {
        id: PROD_FASHION_DRESS_2_ID,
        title: 'Đầm Dạ Hội Đuôi Cá Sang Trọng Đỏ',
        name: 'Đầm Dạ Hội Đỏ',
        description: 'Thiết kế đuôi cá quyến rũ.',
        price: 2200000,
        stock: 10,
        categoryId: CAT_DRESSES_ID,
        image:
          'https://product.hstatic.net/1000318527/product/141279554_2759566720950868_4151769136115659930_o_7f872a3e6d624b05a5ea7652f97d415f_master.jpg',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: false,
        isFeatured: false,
        isActive: true,
        quantity: 10,
      },
      // Jackets
      {
        id: PROD_FASHION_JACKET_1_ID,
        title: 'Áo Khoác Bomber Unisex Phong Cách Rêu',
        name: 'Áo Khoác Bomber Rêu',
        description: 'Áo khoác bomber cá tính.',
        price: 950000,
        stock: 33,
        categoryId: CAT_JACKETS_ID,
        image:
          'https://th.bing.com/th/id/OIP.C1eJqC7tsgCJVjcoFthyGgHaHa?rs=1&pid=ImgDetMain',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: true,
        isActive: true,
        quantity: 33,
      },
      {
        id: PROD_FASHION_JACKET_2_ID,
        title: 'Áo Khoác Dạ Nữ Dáng Dài Hàn Quốc Be',
        name: 'Áo Khoác Dạ Nữ Be',
        description: 'Giữ ấm hiệu quả, phong cách thanh lịch.',
        price: 1800000,
        stock: 18,
        categoryId: CAT_JACKETS_ID,
        image:
          'https://th.bing.com/th/id/R.546f23b70e6b5183a6b8671c24f9361f?rik=bE%2bRQxytFnDcDw&pid=ImgRaw&r=0',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: false,
        isFeatured: false,
        isActive: true,
        quantity: 18,
      },
      // Accessories
      {
        id: PROD_FASHION_HAT_1_ID,
        title: 'Mũ Lưỡi Trai Thêu Chữ Basic Đen',
        name: 'Mũ Lưỡi Trai Đen',
        description: 'Phụ kiện không thể thiếu.',
        price: 250000,
        stock: 70,
        categoryId: CAT_ACCESSORIES_ID,
        image: 'https://cf.shopee.vn/file/afb91fe401164e195dbaee2ffcdf5e0d',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: false,
        isFeatured: true,
        isActive: true,
        quantity: 70,
      },
      {
        id: PROD_FASHION_BAG_1_ID,
        title: 'Túi Tote Vải Canvas In Hình Cute',
        name: 'Túi Tote Canvas Cute',
        description: 'Túi xách tiện lợi, thân thiện môi trường.',
        price: 320000,
        stock: 40,
        categoryId: CAT_ACCESSORIES_ID,
        image:
          'https://th.bing.com/th/id/OIP.P72vSe3bdaqhYGiHwKd9JAHaHa?rs=1&pid=ImgDetMain',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 40,
      },
      // Sportswear
      {
        id: PROD_SPORT_SHIRT_ID,
        title: 'Áo Thun Thể Thao Nam Dri-Fit',
        name: 'Áo Thun Thể Thao Nam',
        description: 'Chất liệu Dri-Fit thoáng khí.',
        price: 450000,
        stock: 55,
        categoryId: CAT_SPORTSWEAR_ID,
        image: 'https://placehold.co/600x400/87CEFA/000000&text=Ao+The+Thao',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: true,
        isFeatured: false,
        isActive: true,
        quantity: 55,
      },
      {
        id: PROD_SPORT_SHORTS_ID,
        title: 'Quần Short Thể Thao Nữ 2 Lớp',
        name: 'Quần Short Thể Thao Nữ',
        description: 'Thiết kế 2 lớp năng động.',
        price: 380000,
        stock: 65,
        categoryId: CAT_SPORTSWEAR_ID,
        image: 'https://placehold.co/600x400/FF69B4/FFFFFF&text=Quan+The+Thao',
        images: [],
        averageRating: 0,
        numReviews: 0,
        isNew: false,
        isFeatured: true,
        isActive: true,
        quantity: 65,
      },
    ];

    await dataSource.getRepository(Product).save(products);

    // Create reviews
    const reviews = [
      {
        id: REVIEW_1_ID,
        userId: USER_ALICE_ID,
        productId: PROD_SHIRT_1_ID,
        rating: 5,
        comment:
          'Áo sơ mi lụa rất đẹp, vải mềm, mặc mát. Form chuẩn, giao hàng nhanh!',
        isActive: true,
        isVerified: true,
      },
      {
        id: REVIEW_2_ID,
        userId: USER_BOB_ID,
        productId: PROD_SHIRT_1_ID,
        rating: 4,
        comment:
          'Chất lượng tốt, nhưng mình thấy giá hơi cao so với một số shop khác.',
        isActive: true,
        isVerified: false,
      },
      {
        id: REVIEW_3_ID,
        userId: USER_ALICE_ID,
        productId: PROD_FASHION_JEAN_1_ID,
        rating: 5,
        comment:
          'Quần jeans co giãn tốt, mặc rất thoải mái. Sẽ ủng hộ shop tiếp!',
        isActive: true,
        isVerified: true,
      },
      {
        id: REVIEW_4_ID,
        userId: USER_CHARLIE_ID,
        productId: PROD_FASHION_JEAN_1_ID,
        rating: 4,
        comment: 'Quần form đẹp, màu cũng ổn. Giao hàng hơi lâu chút.',
        isActive: true,
        isVerified: true,
      },
      {
        id: REVIEW_5_ID,
        userId: USER_BOB_ID,
        productId: PROD_FASHION_DRESS_1_ID,
        rating: 5,
        comment:
          'Váy xinh xỉu, họa tiết vintage đáng yêu. Mặc đi chơi ai cũng khen.',
        isActive: true,
        isVerified: true,
      },
      {
        id: REVIEW_6_ID,
        userId: USER_CHARLIE_ID,
        productId: PROD_TSHIRT_1_ID,
        rating: 4,
        comment:
          'Áo thun chất cotton xịn, mặc thích. Mong shop có thêm nhiều màu pastel.',
        isActive: true,
        isVerified: false,
      },
      {
        id: REVIEW_7_ID,
        userId: USER_ALICE_ID,
        productId: PROD_SPORT_SHIRT_ID,
        rating: 5,
        comment: 'Áo thể thao mặc rất thích, thấm hút mồ hôi tốt.',
        isActive: true,
        isVerified: true,
      },
      {
        id: REVIEW_8_ID,
        userId: USER_BOB_ID,
        productId: PROD_FASHION_JACKET_1_ID,
        rating: 4,
        comment: 'Áo khoác bomber chất ổn, form đẹp.',
        isActive: true,
        isVerified: true,
      },
    ];

    await dataSource.getRepository(Review).save(reviews);

    // Create designs for the design gallery
    const designs = [
      {
        DESIGN_ID: 'a0eebc99-9c0b-4ef8-bb6d-000000000101',
        title: 'Thiên nhiên xanh',
        description: 'Thiết kế với hình ảnh lá cây xanh tươi, biểu tượng của sự bền vững.',
        design_tag: 'nature',
        preview_url: 'https://placehold.co/300x300/4CAF50/FFFFFF&text=Nature+Design',
        license_type: LicenseType.STANDARD,
        status: DesignStatus.APPROVED,
        downloads: 128,
        likes: 45,
        approved_at: new Date(),
        submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        DESIGN_ID: 'a0eebc99-9c0b-4ef8-bb6d-000000000102',
        title: 'Tối giản hiện đại',
        description: 'Thiết kế tối giản với các hình khối hình học đơn giản, phù hợp với phong cách hiện đại.',
        design_tag: 'minimalist',
        preview_url: 'https://placehold.co/300x300/E8E8E8/333333&text=Minimalist',
        license_type: LicenseType.STANDARD,
        status: DesignStatus.APPROVED,
        downloads: 156,
        likes: 62,
        approved_at: new Date(),
        submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        DESIGN_ID: 'a0eebc99-9c0b-4ef8-bb6d-000000000103',
        title: 'Retro cổ điển',
        description: 'Thiết kế theo phong cách retro vintage, mang lại cảm giác hoài niệm.',
        design_tag: 'vintage',
        preview_url: 'https://placehold.co/300x300/DAA520/FFFFFF&text=Vintage+Style',
        license_type: LicenseType.PREMIUM,
        status: DesignStatus.APPROVED,
        downloads: 89,
        likes: 34,
        approved_at: new Date(),
        submitted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        DESIGN_ID: 'a0eebc99-9c0b-4ef8-bb6d-000000000104',
        title: 'Trừu tượng sáng tạo',
        description: 'Thiết kế trừu tượng với các màu sắc nổi bật, thể hiện sự sáng tạo và độc lập.',
        design_tag: 'abstract',
        preview_url: 'https://placehold.co/300x300/FF6B9D/FFFFFF&text=Abstract+Art',
        license_type: LicenseType.STANDARD,
        status: DesignStatus.APPROVED,
        downloads: 203,
        likes: 78,
        approved_at: new Date(),
        submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        DESIGN_ID: 'a0eebc99-9c0b-4ef8-bb6d-000000000105',
        title: 'Typography độc đáo',
        description: 'Thiết kế tập trung vào kiểu chữ sáng tạo và thông điệp ý nghĩa.',
        design_tag: 'typography',
        preview_url: 'https://placehold.co/300x300/1E90FF/FFFFFF&text=Typography',
        license_type: LicenseType.STANDARD,
        status: DesignStatus.APPROVED,
        downloads: 145,
        likes: 51,
        approved_at: new Date(),
        submitted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        DESIGN_ID: 'a0eebc99-9c0b-4ef8-bb6d-000000000106',
        title: 'Hình ảnh chân dung',
        description: 'Thiết kế với hình ảnh chân dung độc đáo, mang tính nhân văn cao.',
        design_tag: 'illustration',
        preview_url: 'https://placehold.co/300x300/9370DB/FFFFFF&text=Illustration',
        license_type: LicenseType.PREMIUM,
        status: DesignStatus.APPROVED,
        downloads: 112,
        likes: 41,
        approved_at: new Date(),
        submitted_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    await dataSource.getRepository(Design).save(designs);
    console.log('✅ Created 6 designs');

    // Create orders
    const order1Date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const order2Date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const order3Date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const order4Date = new Date();

    const initialOrders = [
      {
        id: ORDER_1_ID,
        userId: USER_ALICE_ID,
        Status: OrderStatus.DELIVERED,
        Order_date: order1Date,
        Subtotal: 1400000, // 750000 + 650000
        Discount: 0,
        Total: 1400000,
        shippingAddress: '123 Wonderland Ave, TP. HCM',
        paymentMethod: 'COD',
        paymentStatus: PaymentStatus.COMPLETED,
        notes: 'Giao hàng giờ hành chính.',
        createdAt: order1Date,
      },
      {
        id: ORDER_2_ID,
        userId: USER_BOB_ID,
        Status: OrderStatus.PROCESSING,
        Order_date: order2Date,
        Subtotal: 1650000, // 950000 + 200000*2 + 250000
        Discount: 0,
        Total: 1650000,
        shippingAddress: '456 Construction Rd, Hà Nội',
        paymentMethod: 'CreditCard',
        paymentStatus: PaymentStatus.COMPLETED,
        trackingNumber: 'GHN123XYZ',
        createdAt: order2Date,
      },
      {
        id: ORDER_3_ID,
        userId: USER_CHARLIE_ID,
        Status: OrderStatus.PENDING,
        Order_date: order3Date,
        Subtotal: 1230000, // 200000 + 250000 + 380000 + 480000
        Discount: 0,
        Total: 1230000,
        shippingAddress: '789 Comic Strip, Đà Nẵng',
        paymentMethod: 'BankTransfer',
        paymentStatus: PaymentStatus.PENDING,
        notes: 'Vui lòng gọi trước khi giao.',
        createdAt: order3Date,
      },
      {
        id: ORDER_4_ID,
        userId: USER_ALICE_ID,
        Status: OrderStatus.SHIPPED,
        Order_date: order4Date,
        Subtotal: 600000, // 200000 * 3
        Discount: 0,
        Total: 600000,
        shippingAddress: '123 Wonderland Ave, TP. HCM',
        paymentMethod: 'COD',
        paymentStatus: PaymentStatus.PENDING,
        trackingNumber: 'VTPOST456ABC',
        createdAt: order4Date,
      },
    ];

    await dataSource.getRepository(Order).save(initialOrders);

    // Create order items
    const orderItems = [
      // Order 1 (Alice)
      {
        id: ORDER_ITEM_1_ID,
        orderId: ORDER_1_ID,
        productId: PROD_SHIRT_1_ID,
        quantity: 1,
        price: 750000,
        subtotal: 750000,
      },
      {
        id: ORDER_ITEM_2_ID,
        orderId: ORDER_1_ID,
        productId: PROD_FASHION_JEAN_1_ID,
        quantity: 1,
        price: 650000,
        subtotal: 650000,
      },
      // Order 2 (Bob)
      {
        id: ORDER_ITEM_3_ID,
        orderId: ORDER_2_ID,
        productId: PROD_FASHION_JACKET_1_ID,
        quantity: 1,
        price: 950000,
        subtotal: 950000,
      },
      {
        id: ORDER_ITEM_4_ID,
        orderId: ORDER_2_ID,
        productId: PROD_TSHIRT_1_ID,
        quantity: 2,
        price: 200000,
        subtotal: 400000,
      },
      {
        id: ORDER_ITEM_9_ID,
        orderId: ORDER_2_ID,
        productId: PROD_FASHION_HAT_1_ID,
        quantity: 1,
        price: 250000,
        subtotal: 250000,
      },
      // Order 3 (Charlie)
      {
        id: ORDER_ITEM_5_ID,
        orderId: ORDER_3_ID,
        productId: PROD_TSHIRT_1_ID,
        quantity: 1,
        price: 200000,
        subtotal: 200000,
      },
      {
        id: ORDER_ITEM_6_ID,
        orderId: ORDER_3_ID,
        productId: PROD_FASHION_HAT_1_ID,
        quantity: 1,
        price: 250000,
        subtotal: 250000,
      },
      {
        id: ORDER_ITEM_7_ID,
        orderId: ORDER_3_ID,
        productId: PROD_SPORT_SHORTS_ID,
        quantity: 1,
        price: 380000,
        subtotal: 380000,
      },
      {
        id: ORDER_ITEM_10_ID,
        orderId: ORDER_3_ID,
        productId: PROD_FASHION_SHIRT_2_ID,
        quantity: 1,
        price: 480000,
        subtotal: 480000,
      },
      // Order 4 (Alice)
      {
        id: ORDER_ITEM_8_ID,
        orderId: ORDER_4_ID,
        productId: PROD_TSHIRT_1_ID,
        quantity: 3,
        price: 200000,
        subtotal: 600000,
      },
    ];

    await dataSource.getRepository(OrderItem).save(orderItems);

    // Create carts for users
    const carts = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-000000000061',
        userId: USER_ALICE_ID,
        totalAmount: 0,
        itemCount: 0,
        isActive: true,
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-000000000062',
        userId: USER_BOB_ID,
        totalAmount: 0,
        itemCount: 0,
        isActive: true,
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-000000000063',
        userId: USER_CHARLIE_ID,
        totalAmount: 0,
        itemCount: 0,
        isActive: true,
      },
    ];

    await dataSource.getRepository(Cart).save(carts);

    // Seed packaging
    const packagingList = [
      { name: 'Small Box', max_weight: 500, cost: 0.5 },
      { name: 'Medium Box', max_weight: 2000, cost: 1.2 },
      { name: 'Poly Mailer', max_weight: 1000, cost: 0.3 },
    ];
    await dataSource.getRepository(Packaging).save(packagingList);

    // Seed return reasons
    const returnReasons = [
      { reason: 'Damaged item', description: 'Product arrived damaged' },
      { reason: 'Wrong item', description: 'Received wrong item/size/color' },
      {
        reason: 'Not as described',
        description: 'Product does not match description',
      },
    ];
    await dataSource.getRepository(ReturnReason).save(returnReasons);

    // Seed employees
    const employees = [
      {
        userId: USER_ADMIN_ID,
        taxID: 'TAX-ADM-001',
        full_name: 'Jane Supervisor',
        role: EmployeeRole.MANAGER,
        shift: 'morning',
        salary: 1200,
        join_date: new Date('2023-01-01'),
      },
      {
        userId: USER_BOB_ID,
        taxID: 'TAX-STF-002',
        full_name: 'John Picker',
        role: EmployeeRole.STAFF,
        shift: 'evening',
        salary: 800,
        join_date: new Date('2023-03-01'),
      },
    ];
    await dataSource.getRepository(Employee).save(employees);

    // Seed assets and disposal logs
    const assets = [
      {
        name: 'Sample Design File',
        url: 'https://example.com/designs/sample-design.png',
        mimeType: 'image/png',
        sizeBytes: 102400,
        uploadedBy: USER_ADMIN_ID,
      },
      {
        name: 'Product Photo',
        url: 'https://example.com/assets/product-photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 204800,
        uploadedBy: USER_ADMIN_ID,
      },
    ];
    const savedAssets = await dataSource.getRepository(Asset).save(assets);

    const disposals = [
      {
        assetId: savedAssets[0].id,
        reason: 'Outdated design',
        note: 'Replaced by new version',
        disposedBy: USER_ADMIN_ID,
      },
    ];
    await dataSource.getRepository(AssetDisposal).save(disposals);

    // Seed addresses for users
    const aliceAddress = await dataSource.getRepository(Address).save({
      userId: USER_ALICE_ID,
      label: 'Home',
      line1: '123 Wonderland Ave',
      line2: '',
      state: 'TP. HCM',
      zip: '700000',
      country: 'VN',
      is_default: true,
    });

    const bobAddress = await dataSource.getRepository(Address).save({
      userId: USER_BOB_ID,
      label: 'Home',
      line1: '456 Construction Rd',
      line2: '',
      state: 'Hà Nội',
      zip: '100000',
      country: 'VN',
      is_default: true,
    });

    const charlieAddress = await dataSource.getRepository(Address).save({
      userId: USER_CHARLIE_ID,
      label: 'Home',
      line1: '789 Comic Strip',
      line2: '',
      state: 'Đà Nẵng',
      zip: '550000',
      country: 'VN',
      is_default: true,
    });

    // Seed SKU variants and stocks for multiple products
    const productsForSku = await dataSource.getRepository(Product).find({
      where: [
        { id: PROD_SHIRT_1_ID },
        { id: PROD_TSHIRT_1_ID },
        { id: PROD_FASHION_JEAN_1_ID },
        { id: PROD_FASHION_JACKET_1_ID },
      ],
    });

    const savedStocks: Stock[] = [];
    for (const product of productsForSku) {
      const sku = dataSource.getRepository(SkuVariant).create({
        productId: product.id,
        SizeCode: 'M',
        ColorCode: 'BLACK',
        price: product.price,
        weight_grams: 250,
        base_cost: product.price * 0.6,
        sku_name: `${product.name}-M-BLACK`,
        avai_status: 'available',
        currency: 'VND',
      });
      const savedSku = await dataSource.getRepository(SkuVariant).save(sku);

      const stock = dataSource.getRepository(Stock).create({
        skuId: savedSku.SkuID,
        qty_inbound: product.quantity || 50,
        qty_outbound: 0,
        qty_on_hand: product.quantity || 50,
        qty_reserved: 0,
      });
      const savedStock = await dataSource.getRepository(Stock).save(stock);
      savedStocks.push(savedStock);
    }

    // Seed shipments for all orders with packaging and shipment items
    const packagingAll = await dataSource.getRepository(Packaging).find({
      order: { createdAt: 'ASC' },
    });
    const pkgSmall = packagingAll[0]?.PKG_ID;
    const pkgMedium = packagingAll[1]?.PKG_ID || pkgSmall;

    const ordersForShipments = await dataSource.getRepository(Order).find({
      order: { createdAt: 'ASC' },
    });

    const shipments: Shipment[] = [];
    for (let i = 0; i < ordersForShipments.length; i++) {
      const order = ordersForShipments[i];
      let addressId: string;
      let status: ShipmentStatus;
      let trackingNumber: string | null = null;

      // Assign address based on user
      if (order.userId === USER_ALICE_ID) {
        addressId = aliceAddress.addr_id;
      } else if (order.userId === USER_BOB_ID) {
        addressId = bobAddress.addr_id;
      } else {
        addressId = charlieAddress.addr_id;
      }

      // Assign status based on order status
      if (order.Status === OrderStatus.DELIVERED) {
        status = ShipmentStatus.DELIVERED;
        trackingNumber = `SHIP-DEMO-${String(i + 1).padStart(4, '0')}`;
      } else if (order.Status === OrderStatus.SHIPPED) {
        status = ShipmentStatus.IN_TRANSIT;
        trackingNumber =
          order.trackingNumber || `SHIP-DEMO-${String(i + 1).padStart(4, '0')}`;
      } else if (order.Status === OrderStatus.PROCESSING) {
        status = ShipmentStatus.PROCESSING;
      } else {
        status = ShipmentStatus.PENDING;
      }

      const shipmentRepo = dataSource.getRepository(Shipment);
      const shipment: Shipment = shipmentRepo.create();
      shipment.orderId = order.id;
      shipment.addressId = addressId;
      shipment.packagingId = i % 2 === 0 ? pkgSmall : pkgMedium;
      shipment.ship_date =
        order.Status !== OrderStatus.PENDING
          ? new Date(order.Order_date.getTime() + 24 * 60 * 60 * 1000)
          : null;
      shipment.status = status;
      shipment.Shipping_fee = 30000 + i * 5000;
      shipment.carrier = i % 2 === 0 ? 'VNPost' : 'GHN';
      shipment.service_level = i % 2 === 0 ? 'Standard' : 'Express';
      shipment.tracking_number = trackingNumber;

      const savedShipment = await shipmentRepo.save(shipment);
      shipments.push(savedShipment);

      // Link all order items to shipment as shipment items
      const orderItems = await dataSource.getRepository(OrderItem).find({
        where: { orderId: order.id },
      });
      for (const orderItem of orderItems) {
        await dataSource.getRepository(ShipmentItem).save({
          shipmentId: savedShipment.Ship_ID,
          orderItemId: orderItem.id,
          quantity: orderItem.qty,
        });
      }
    }

    // Seed stock movements with various types
    if (savedStocks.length > 0) {
      const stockMovements = [
        // Inbound movements (initial stock)
        {
          stockId: savedStocks[0].StockID,
          type: StockMovementType.INBOUND,
          quantity: 50,
          referenceType: 'purchase',
          referenceId: 'PO-001',
          note: 'Initial stock purchase',
        },
        {
          stockId: savedStocks[1]?.StockID,
          type: StockMovementType.INBOUND,
          quantity: 100,
          referenceType: 'purchase',
          referenceId: 'PO-002',
          note: 'Initial stock purchase',
        },
        // Outbound movements (sales)
        {
          stockId: savedStocks[0].StockID,
          type: StockMovementType.OUTBOUND,
          quantity: 5,
          referenceType: 'order',
          referenceId: ORDER_1_ID,
          note: 'Order fulfillment',
        },
        {
          stockId: savedStocks[1]?.StockID,
          type: StockMovementType.OUTBOUND,
          quantity: 2,
          referenceType: 'order',
          referenceId: ORDER_2_ID,
          note: 'Order fulfillment',
        },
        // Reserve movements (pending orders)
        {
          stockId: savedStocks[0].StockID,
          type: StockMovementType.RESERVE,
          quantity: 3,
          referenceType: 'order',
          referenceId: ORDER_4_ID,
          note: 'Reserved for pending order',
        },
        {
          stockId: savedStocks[1]?.StockID,
          type: StockMovementType.RESERVE,
          quantity: 1,
          referenceType: 'order',
          referenceId: ORDER_3_ID,
          note: 'Reserved for pending order',
        },
        // Release movements (cancelled reservations)
        {
          stockId: savedStocks[0].StockID,
          type: StockMovementType.RELEASE,
          quantity: 1,
          referenceType: 'order',
          referenceId: ORDER_4_ID,
          note: 'Released from cancelled reservation',
        },
        // Adjust movements (inventory corrections)
        {
          stockId: savedStocks[0].StockID,
          type: StockMovementType.ADJUST,
          quantity: -2,
          referenceType: 'adjustment',
          referenceId: 'ADJ-001',
          note: 'Inventory correction - damaged items',
        },
        {
          stockId: savedStocks[1]?.StockID,
          type: StockMovementType.ADJUST,
          quantity: 5,
          referenceType: 'adjustment',
          referenceId: 'ADJ-002',
          note: 'Inventory correction - found extra stock',
        },
      ];

      for (const movement of stockMovements) {
        // Only create movement if stockId exists and is valid
        if (
          movement.stockId &&
          savedStocks.some((s) => s.StockID === movement.stockId)
        ) {
          await dataSource.getRepository(StockMovement).save(movement);
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Sample data includes:');
    console.log('   - 4 Users (1 Admin, 3 Regular Users)');
    console.log('   - 3 Addresses (one per user)');
    console.log('   - 6 Categories');
    console.log('   - 16 Products');
    console.log('   - 4 SKU Variants with Stocks');
    console.log('   - 8 Reviews');
    console.log('   - 4 Orders with Order Items');
    console.log('   - 4 Shipments with Shipment Items');
    console.log(
      '   - 9 Stock Movements (inbound, outbound, reserve, release, adjust)',
    );
    console.log('   - 3 Shopping Carts');
    console.log('   - 3 Packaging options');
    console.log('   - 3 Return Reasons');
    console.log('   - 2 Employees');
    console.log('   - 4 Sizes, 2 Materials, 2 Print Methods');
    console.log('   - 2 Assets with 1 Disposal log');
    console.log('');
    console.log('🔑 Test Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: alice@example.com / user1pass');
    console.log('   User: bob@example.com / user2pass');
    console.log('   User: charlie@example.com / user3pass');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
