"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function validateEnv() {
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
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: parseInt(process.env.DB_PORT, 10),
        DB_SSL: process.env.DB_SSL === 'true',
        // Server
        PORT: parseInt(process.env.PORT || '5000', 10),
        NODE_ENV: (process.env.NODE_ENV || 'development'),
        // JWT
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
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
        // MongoDB (Optional)
        MONGODB_URI: process.env.MONGODB_URI,
    };
}
exports.config = validateEnv();
exports.default = exports.config;
