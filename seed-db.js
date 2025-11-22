const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Starting database seeding...');

try {
    // Set environment variables
    process.env.NODE_ENV = 'development';
    process.env.DB_HOST = process.env.DB_HOST || 'localhost';
    process.env.DB_PORT = process.env.DB_PORT || '5432';
    process.env.DB_USER = process.env.DB_USER || 'postgres';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'password';
    process.env.DB_NAME = process.env.DB_NAME || 'dbms';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

    // Run the TypeScript seeding script
    execSync('npx ts-node src/seeders/seed.ts', {
        stdio: 'inherit',
        cwd: __dirname
    });

    console.log('✅ Database seeding completed successfully!');
} catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
}
