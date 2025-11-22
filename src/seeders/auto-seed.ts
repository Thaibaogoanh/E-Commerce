import { DataSource } from 'typeorm';
import { seedDatabase } from './sample-data';

export async function autoSeedDatabase(dataSource: DataSource) {
  try {
    // Check if data already exists
    const userCount = await dataSource.query('SELECT COUNT(*) FROM users');
    if (userCount[0].count > 0) {
      console.log('📊 Database already has data, skipping seeding...');
      return;
    }

    console.log('🌱 Auto-seeding database...');
    await seedDatabase(dataSource);
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error);
    // Don't throw error to prevent app startup failure
  }
}
