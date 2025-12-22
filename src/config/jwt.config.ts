/**
 * JWT Configuration Constants
 * These constants ensure consistent JWT secret across the application
 */

// Use environment variable if set, otherwise fallback to this default
// In production, ALWAYS set JWT_SECRET environment variable
export const JWT_SECRET =
  process.env.JWT_SECRET || 'sustainique-secret-key-default';

// Token expiration time
export const JWT_EXPIRES_IN = '30d';

// Verify that secret is not using default in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'sustainique-secret-key-default') {
  console.warn('⚠️  WARNING: JWT_SECRET is using default value in production!');
  console.warn('⚠️  Please set JWT_SECRET environment variable for security!');
}

