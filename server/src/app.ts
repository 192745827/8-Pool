import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import authRouter from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

export const app = express();
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware configurations
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing mounts
app.get('/', (req, res) => {
  res.send('Backend Running Successfully');
});
app.use('/health', healthRouter);
app.use('/api/users', authRouter);

// Fallback global error handler
app.use(errorHandler);

export default app;
