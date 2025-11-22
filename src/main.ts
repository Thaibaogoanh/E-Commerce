import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { autoSeedDatabase } from './seeders/auto-seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('🌿 SUSTAINIQUE - Backend API')
    .setDescription(
      'API Documentation for SUSTAINIQUE - Print-on-Demand E-commerce Platform\n\n' +
      '## 🎯 Overview\n' +
      'This is the comprehensive API documentation for the Sustainique backend, a Print-on-Demand (POD) platform ' +
      'specializing in sustainable and eco-friendly fashion.\n\n' +
      '## 🔑 Key Features\n' +
      '- ✅ Print-on-Demand (POD) System\n' +
      '- ✅ Customizer Tool with Save/Load Designs\n' +
      '- ✅ Green Points & Rewards System\n' +
      '- ✅ Voucher Management\n' +
      '- ✅ Favorites/Wishlist\n' +
      '- ✅ Order Management with Tracking\n' +
      '- ✅ Review System with Media Support\n' +
      '- ✅ SKU Variants (Size, Color, Material)\n' +
      '- ✅ Design Library Management\n\n' +
      '## 🔐 Authentication\n' +
      'Most endpoints require JWT Bearer token in Authorization header:\n' +
      '`Authorization: Bearer <your-jwt-token>`\n\n' +
      '## 📊 Base URL\n' +
      '`http://localhost:5000/api`'
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Products', 'Product management')
    .addTag('Categories', 'Category management')
    .addTag('Cart', 'Shopping cart operations')
    .addTag('Orders', 'Order processing')
    .addTag('Reviews', 'Review system')
    .addTag('Customizer', 'Design customizer tool')
    .addTag('Favorites', 'Favorites/Wishlist management')
    .addTag('Rewards', 'Green Points & Rewards')
    .addTag('Vouchers', 'Voucher management')
    .addTag('Designs', 'Design library')
    .addTag('SKU Variants', 'SKU variants management')
    .addTag('Addresses', 'Address management')
    .addTag('Payment Methods', 'Payment methods management')
    .addTag('Shipments', 'Shipment tracking')
    .addTag('Users', 'User management')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addServer('http://localhost:5000', 'Local development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 0; }
    `,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 5000);

  // Auto-seed database if in development mode
  if (process.env.NODE_ENV === 'development') {
    try {
      const dataSource = app.get('DataSource');
      await autoSeedDatabase(dataSource);
    } catch (error) {
      console.log('⚠️ Auto-seeding skipped (DataSource not available)');
    }
  }

  await app.listen(port);
  console.log(
    `🚀 Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`,
  );
  console.log(`📚 Swagger documentation: http://localhost:${port}/swagger`);
}
void bootstrap();
