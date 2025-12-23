import { AppDataSource } from './src/config/data-source';
import { seedDatabaseEnhanced } from './src/seeders/sample-data-enhanced';

/**
 * Reset database: Delete all data and re-seed
 * Usage: ts-node reset-db.ts
 */
async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');

  try {
    // Initialize DataSource
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully\n');

    // Delete all data
    console.log('🗑️ Deleting all existing data...');
    const entities = [
      'user_vouchers', 'vouchers', 'saved_designs', 'favorites',
      'payments', 'payment_methods', 'asset_disposals', 'assets',
      'stock_movements', 'stocks', 'sku_variants',
      'shipment_items', 'shipments', 'order_items', 'orders',
      'cart_items', 'carts', 'reviews', 'designs',
      'products', 'categories', 'packagings', 'return_reasons',
      'employees', 'sizes', 'materials', 'print_methods',
      'color_options', 'addresses', 'users'
    ];

    for (const entity of entities) {
      try {
        await AppDataSource.query(`DELETE FROM ${entity}`);
        console.log(`   ✓ Cleared ${entity}`);
      } catch (e) {
        // Ignore errors
      }
    }
    console.log('✅ All data deleted\n');

    // Seed fresh data
    console.log('🌱 Seeding database with fresh sample data...');
    await seedDatabaseEnhanced(AppDataSource);
    console.log('✅ Database seeded successfully\n');

    console.log('🎉 Database reset completed!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

void resetDatabase();



