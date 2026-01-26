import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cowRoutes from './routes/cow.routes';
import healthRoutes from './routes/health-record.routes';
import heatCycleRoutes from './routes/heat-cycle.routes';
import taskRoutes from './routes/task.routes';

const app = express();

// --------------------
// Middleware
// --------------------
app.use(cors());
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
