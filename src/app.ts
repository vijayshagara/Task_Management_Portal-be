import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cowRoutes from './routes/cow.routes';
import healthRoutes from './routes/health-record.routes';
import heatCycleRoutes from './routes/heat-cycle.routes';
import taskRoutes from './routes/task.routes';

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://toral-cattle-farm.netlify.app",
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
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options(/.*/, cors());
app.use(express.json({ limit: '10mb' })); // safety for payload size

// --------------------
// Routes
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cows', cowRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/heat-cycles', heatCycleRoutes);
app.use('/api/tasks', taskRoutes);

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

import { oauth2Client } from "./services1/google.service";

// 🔹 Generate Refresh Token (Temporary Route)
app.get("/generate-token", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    prompt: "consent",
  });

  res.redirect(url);
});

// 🔹 Callback Route
app.get("/oauth2callback", async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code as string);

    console.log("\n🔥 COPY THIS REFRESH TOKEN 🔥\n");
    console.log(tokens.refresh_token);
    console.log("\n🔥 SAVE THIS IN .env AS GOOGLE_REFRESH_TOKEN 🔥\n");

    res.send("Refresh token printed in terminal. Copy it.");
  } catch (error: any) {
    console.error(error.message);
    res.status(500).send("Error generating refresh token");
  }
});

export default app;
