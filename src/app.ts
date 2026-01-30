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
app.options("*", cors());
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

export default app;
