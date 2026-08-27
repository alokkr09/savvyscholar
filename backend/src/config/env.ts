import dotenv from 'dotenv';
import path from 'path';

// Load .env file from root of backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/savvyscholar',
  JWT_SECRET: process.env.JWT_SECRET || 'savvy_scholar_dev_secret_fallback_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Fail fast in production if critical secrets are missing
if (env.isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev_secret'))) {
  console.error('FATAL: In production, JWT_SECRET must be explicitly set to a cryptographically secure value.');
  process.exit(1);
}
