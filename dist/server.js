"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const env_1 = __importDefault(require("./utils/env"));
const google_service_1 = require("./services1/google.service");
const mongodb_1 = require("./config/mongodb");
const run_migrations_1 = require("./scripts/run-migrations");
// Cron only on long-running servers (not Vercel serverless)
if (!process.env.VERCEL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./services1/heat-cron.service');
}
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
async function connectDatabase(retries = 0) {
    try {
        await database_1.default.authenticate();
        console.log("✅ Database connected successfully");
        return true;
    }
    catch (error) {
        const isLastRetry = retries >= MAX_RETRIES - 1;
        const errorMsg = error.message || error.toString();
        console.error(`❌ Database connection failed (Attempt ${retries + 1}/${MAX_RETRIES}):`, errorMsg);
        if (isLastRetry) {
            console.error("❌ Max retries reached. Check your database configuration:");
            console.error(`   - Host: ${env_1.default.DB_HOST}`);
            console.error(`   - Port: ${env_1.default.DB_PORT}`);
            console.error(`   - Database: ${env_1.default.DB_NAME}`);
            return false;
        }
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return connectDatabase(retries + 1);
    }
}
async function syncDatabase() {
    try {
        // Always run idempotent SQL migrations (safe for production/Vercel)
        await (0, run_migrations_1.runMigrations)();
        // Dev-only: Sequelize alter sync for local iteration
        if (env_1.default.NODE_ENV !== "production" && !process.env.VERCEL) {
            await database_1.default.sync({ alter: true });
            console.log("✅ Database schema synchronized (dev alter)");
        }
    }
    catch (error) {
        console.error("❌ Database sync failed:", error.message);
        throw error;
    }
}
async function initializeGoogleAPI() {
    if (!google_service_1.googleInitialized) {
        console.log("ℹ️ Google Calendar features disabled - credentials not configured");
        return;
    }
    console.log("📅 Fetching Google Calendar events...");
    await (0, google_service_1.listEvents)();
}
async function startServer() {
    return new Promise((resolve, reject) => {
        const server = app_1.default.listen(env_1.default.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env_1.default.PORT}`);
            console.log(`📊 Environment: ${env_1.default.NODE_ENV}`);
            resolve();
        });
        server.on("error", reject);
    });
}
async function initialize() {
    try {
        console.log("🔧 Initializing application...\n");
        // Step 1: Connect to database
        const dbConnected = await connectDatabase();
        if (!dbConnected) {
            process.exit(1);
        }
        // Step 2: Sync database schema
        await syncDatabase();
        // Step 3: Connect to MongoDB for cow images (optional)
        await (0, mongodb_1.connectMongo)();
        // Step 4: Initialize Google API (non-blocking)
        await initializeGoogleAPI();
        // Step 5: Start server
        await startServer();
        console.log("\n✨ Application ready!");
    }
    catch (error) {
        console.error("\n❌ Application initialization failed:");
        console.error(error.message || error);
        console.error("\n📋 Troubleshooting:");
        console.error("1. Check your .env file for correct database credentials");
        console.error("2. Ensure database server is running");
        console.error("3. Verify network connectivity to the database host");
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on("SIGTERM", async () => {
    console.log("\n🛑 SIGTERM received, shutting down gracefully...");
    await database_1.default.close();
    await (0, mongodb_1.closeMongo)();
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("\n🛑 SIGINT received, shutting down gracefully...");
    await database_1.default.close();
    await (0, mongodb_1.closeMongo)();
    process.exit(0);
});
initialize();
