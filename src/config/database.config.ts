import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbHost = configService.get<string>('DB_HOST', 'localhost');
  const dbUser = configService.get<string>('DB_USER') || configService.get<string>('DB_USERNAME', 'myuser');
  
  // AWS RDS requires SSL connection
  // Enable SSL if connecting to AWS RDS or in production
  const isAwsRds = dbHost.includes('.rds.amazonaws.com');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const enableSSL = isAwsRds || isProduction;

  return {
    type: 'postgres',
    host: dbHost,
    port: configService.get<number>('DB_PORT', 5432),
    username: dbUser,
    password: configService.get<string>('DB_PASSWORD', 'mypassword'),
    database: configService.get<string>('DB_NAME', 'mydatabase'),
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: enableSSL ? { rejectUnauthorized: false } : false,
  };
};
