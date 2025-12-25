import { AppDataSource } from '../config/data-source';
import { seedDatabaseEnhanced } from '../seeders/sample-data-enhanced';

/**
 * Reset database: Clear all data and re-seed
 * Usage: ts-node src/scripts/reset-seed-data.ts
 */
async function resetAndSeedDatabase() {
  console.log('🔄 Starting database reset and re-seed...\n');

  try {
    // Initialize DataSource
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully\n');

    // Step 1: Run migrations first to ensure schema is up to date
    console.log('📦 Running migrations...');
    const migrations = await AppDataSource.runMigrations();
    if (migrations.length > 0) {
      console.log(`✅ Applied ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    } else {
      console.log('✅ No new migrations to apply');
    }
    console.log('');

    // Step 2: Synchronize entities (create/update tables from entities)
    console.log('📋 Synchronizing database schema from entities...');
    await AppDataSource.synchronize();
    console.log('✅ Database schema synchronized\n');

    // Step 3: Clear all data
    console.log('🗑️ Clearing all existing data...');
    const entities = AppDataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
    }
    console.log('✅ All data cleared\n');

    // Step 4: Re-seed database
    console.log('🌱 Re-seeding database with enhanced sample data...');
    await seedDatabaseEnhanced(AppDataSource);
    console.log('✅ Database re-seeded successfully\n');

    console.log('🎉 Database reset and re-seed completed!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

void resetAndSeedDatabase();
