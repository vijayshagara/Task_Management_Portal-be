import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  // Database
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_SSL: boolean;

  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production';

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  // Google OAuth (Optional)
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  GOOGLE_REFRESH_TOKEN?: string;

  // Email (Optional)
  EMAIL_USER?: string;
  EMAIL_PASSWORD?: string;

  // Redis (Optional)
  REDIS_URL?: string;
}

function validateEnv(): EnvConfig {
  const required = [
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_PORT',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n📋 Update your .env file with these variables');
    process.exit(1);
  }

  return {
    // Database (Required)
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: parseInt(process.env.DB_PORT!, 10),
    DB_SSL: process.env.DB_SSL === 'true',

    // Server
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,

    // Google OAuth (Optional)
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,

    // Email (Optional)
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

    // Redis (Optional)
    REDIS_URL: process.env.REDIS_URL,
  };
}

export const config = validateEnv();
export default config;
