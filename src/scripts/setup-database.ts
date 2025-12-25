import { AppDataSource } from '../config/data-source';
import { seedDatabaseEnhanced } from '../seeders/sample-data-enhanced';

/**
 * Setup database: Run migrations first, then seed data
 * Usage: ts-node src/scripts/setup-database.ts
 */
async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Initialize DataSource
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully\n');

    // Step 1: Run migrations
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

    // Step 2: Synchronize entities (create tables from entities)
    console.log('📋 Synchronizing database schema from entities...');
    await AppDataSource.synchronize();
    console.log('✅ Database schema synchronized\n');

    // Step 3: Check if data exists
    let hasData = false;
    try {
      const userCount = await AppDataSource.query<Array<{ count: string }>>(
        'SELECT COUNT(*) as count FROM users',
      );
      hasData = parseInt(userCount[0]?.count || '0') > 0;
    } catch {
      // Table doesn't exist yet, will be created during seed
      hasData = false;
    }

    if (hasData) {
      console.log('📊 Database already has data, skipping seeding...');
      console.log('💡 To re-seed, run: npm run seed:ts\n');
    } else {
      // Step 4: Seed database with enhanced data
      console.log('🌱 Seeding database with enhanced sample data...');
      await seedDatabaseEnhanced(AppDataSource);
      console.log('✅ Database seeded successfully\n');
    }

    console.log('🎉 Database setup completed!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

void setupDatabase();
