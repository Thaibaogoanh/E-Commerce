import { DataSource } from 'typeorm';
import { seedDatabase } from './sample-data';
import { ConfigService } from '@nestjs/config';

async function runSeed() {
  console.log('🌱 Starting database seeding...');

  const configService = new ConfigService();
  
  // Create DataSource with proper configuration
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USER', 'postgres'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME', 'dbms'),
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: configService.get<string>('NODE_ENV') === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully');

    await seedDatabase(dataSource);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

runSeed();
