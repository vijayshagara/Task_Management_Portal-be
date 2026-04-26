import "dotenv/config";
import app from "./app";
import sequelize from "./config/database";
import config from "./utils/env";
import { listEvents, googleInitialized } from "./services1/google.service";
import { createMeeting } from "./services1/google.service";
import "./services1/heat-cron.service";  // ← Start cron job

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function connectDatabase(retries = 0): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
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

    console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectDatabase(retries + 1);
  }
}

async function syncDatabase() {
  try {
    if (config.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database schema synchronized");
    }
  } catch (error: any) {
    console.error("❌ Database sync failed:", error.message);
    throw error;
  }
}

async function initializeGoogleAPI() {
  if (!googleInitialized) {
    console.log("ℹ️ Google Calendar features disabled - credentials not configured");
    return;
  }

  console.log("📅 Fetching Google Calendar events...");
  await listEvents();
}

async function startServer() {
  return new Promise<void>((resolve, reject) => {
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${config.PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
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

    // Step 3: Initialize Google API (non-blocking)
    await initializeGoogleAPI();

    // Step 4: Start server
    await startServer();

    console.log("\n✨ Application ready!");

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
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

initialize();
