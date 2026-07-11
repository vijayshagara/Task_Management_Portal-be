import express from 'express';
import cors from 'cors';
import { oauth2Client } from "./services1/google.service";
import config from "./utils/env";

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cowRoutes from './routes/cow.routes';
import healthRoutes from './routes/health-record.routes';
import heatCycleRoutes from './routes/heat-cycle.routes';
import taskRoutes from './routes/task.routes';
import profileRoutes from './routes/profile.routes';
import postRoutes from './routes/post.routes';
import followRoutes from './routes/follow.routes';
import socialRoutes from './routes/social.routes';
import farmRoutes from './routes/farm.routes';
import { ensureDbReady } from './config/init-db';

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://task-management-portal-be.vercel.app",
  "https://toral-cattle-farm.netlify.app",
  "https://toral-cattle-farm.netlify.app/",
];
// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options(
  /.*/,
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: '10mb' }));

// Ensure DB schema is up to date (fixes missing columns on Vercel production)
app.use(async (_req, res, next) => {
  try {
    await ensureDbReady();
    next();
  } catch (error: any) {
    console.error('DB init failed:', error.message);
    res.status(503).json({ message: 'Database unavailable', detail: error.message });
  }
});

// --------------------
// Routes
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cows', cowRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/heat-cycles', heatCycleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/farm', farmRoutes);

// --------------------
// Health check (IMPORTANT for free hosting)
// --------------------
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// --------------------
// Error handling (enable later)
// --------------------
// app.use(errorHandler);

// Google OAuth helper routes — disabled in production
if (config.NODE_ENV !== 'production') {
  app.get("/generate-token", (req: express.Request, res: express.Response): any => {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_REDIRECT_URI) {
      return res.status(400).json({
        error: "Google OAuth credentials not configured in .env",
        required: [
          "GOOGLE_CLIENT_ID",
          "GOOGLE_CLIENT_SECRET",
          "GOOGLE_REDIRECT_URI",
        ],
      });
    }

    if (!oauth2Client) {
      return res.status(500).json({ error: "OAuth client not initialized" });
    }

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
      prompt: "consent",
    });

    res.redirect(url);
  });

  app.get("/oauth2callback", async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).send("Missing authorization code");
      }

      if (!oauth2Client) {
        return res.status(500).json({ error: "OAuth client not initialized" });
      }

      const { tokens } = await oauth2Client.getToken(code as string);

      if (!tokens.refresh_token) {
        return res.status(400).send("Failed to obtain refresh token");
      }

      console.log("\n");
      console.log("═".repeat(60));
      console.log("🔥 REFRESH TOKEN GENERATED SUCCESSFULLY 🔥");
      console.log("═".repeat(60));
      console.log("\n📋 Add this to your .env file:\n");
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      console.log("═".repeat(60));
      console.log("\n");

      res.send(`
        <h1>Success</h1>
        <p>Your refresh token has been generated and printed in the server console.</p>
        <p>Copy the token from your terminal and add it to your .env file.</p>
        <p>Then restart your server.</p>
      `);
    } catch (error: any) {
      console.error("Token generation error:", error.message);
      res.status(500).send(`<h1>Error generating refresh token</h1><p>See server logs for details.</p>`);
    }
  });
}

export default app;
