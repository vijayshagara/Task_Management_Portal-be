import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Behind Railway / Vercel / Netlify proxies — needed so rate limiting sees the real client IP.
app.set('trust proxy', 1);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "https://task-management-portal-be.vercel.app",
  "https://toral-cattle-farm.netlify.app",
  "https://toral-cattle-farm.netlify.app/",
  // Extra origins for new deployments, e.g. CORS_ORIGINS=https://my-app.up.railway.app,https://example.com
  ...(process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
];

/** Vite may bind 5173+ when multiple instances run; allow local dev hosts. */
function isAllowedOrigin(origin?: string | null): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (config.NODE_ENV !== 'production') {
    try {
      const url = new URL(origin);
      if (
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
        url.protocol === 'http:'
      ) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

function corsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  // Use false (not Error) so rejected origins get a clean CORS failure, not HTTP 500
  callback(null, isAllowedOrigin(origin));
}

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options(
  /.*/,
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Security headers (images are served cross-origin to the web/mobile apps).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(express.json({ limit: '10mb' }));

// Brute-force protection for credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'], authLimiter);

// General API limiter (generous; protects against runaway clients).
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
}));

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
// Error handling
// --------------------
app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err?.message || err);
  if (res.headersSent) return;
  const status = err?.status || err?.statusCode || 500;
  res.status(status).json({ message: status >= 500 ? 'Internal server error' : err.message });
});

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
