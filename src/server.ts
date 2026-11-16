import "dotenv/config";
import app from "./app";
import sequelize from "./config/database";
import config from "./utils/env";
import { listEvents, googleInitialized } from "./services1/google.service";
import { createMeeting } from "./services1/google.service";
import { connectMongo, closeMongo } from "./config/mongodb";
import { runMigrations } from "./scripts/run-migrations";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

// Cron only on long-running servers (not Vercel serverless)
if (!process.env.VERCEL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./services1/heat-cron.service');
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function connectDatabase(retries = 0): Promise<boolean> {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error: any) {
    const isLastRetry = retries >= MAX_RETRIES - 1;
    const errorMsg = error.message || error.toString();

    console.error(`❌ Database connection failed (Attempt ${retries + 1}/${MAX_RETRIES}):`, errorMsg);

    if (isLastRetry) {
      console.error("❌ Max retries reached. Check your database configuration:");
      console.error(`   - Host: ${config.DB_HOST}`);
      console.error(`   - Port: ${config.DB_PORT}`);
      console.error(`   - Database: ${config.DB_NAME}`);
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectDatabase(retries + 1);
  }
}

async function syncDatabase() {
  try {
    // Always run idempotent SQL migrations (safe for production/Vercel)
    await runMigrations();

    // Dev-only: Sequelize alter sync for local iteration
    if (process.env.DB_SYNC_ALTER === "true" && config.NODE_ENV !== "production" && !process.env.VERCEL) {
      await sequelize.sync({ alter: true });
    }
  } catch (error: any) {
    console.error("❌ Database sync failed:", error.message);
    throw error;
  }
}

async function initializeGoogleAPI() {
  if (!googleInitialized) {
    return;
  }

  await listEvents();
}

async function startServer() {
  return new Promise<void>((resolve, reject) => {
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Backend started on port ${config.PORT}`);
      resolve();
    });

    server.on("error", reject);
  });
}

async function initialize() {
  try {

    // Step 1: Connect to database
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      process.exit(1);
    }

    // Step 2: Sync database schema
    await syncDatabase();

    // Step 3: Connect to MongoDB for cow images (optional)
    await connectMongo();

    // Step 4: Initialize Google API (non-blocking)
    await initializeGoogleAPI();

    // Step 5: Start server
    await startServer();


  } catch (error: any) {
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
  await sequelize.close();
  await closeMongo();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await sequelize.close();
  await closeMongo();
  process.exit(0);
});

initialize();
