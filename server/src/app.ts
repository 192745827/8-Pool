import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import authRouter from './routes/auth.routes';
import roomRouter from './routes/room.routes';
import friendRouter from './routes/friend.routes';
import replayRouter from './routes/replay.routes';
import shopRouter from './routes/shop.routes';
import dailyRouter from './routes/daily.routes';
import { helmetSecurityHeaders, enforceSecurityHeaders } from './middleware/security.middleware';
import { apiLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/validation.middleware';
import { performanceMetrics } from './middleware/metrics.middleware';
import { monitoring } from './utils/monitoring';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Monitoring & Observability Telemetry
monitoring.init();

export const app = express();
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Performance Telemetry & Metrics
app.use(performanceMetrics);

// Security & Helmet Middleware
app.use(helmetSecurityHeaders);
app.use(enforceSecurityHeaders);

// Global Rate Limiter
app.use('/api', apiLimiter);

// Middleware configurations
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? corsOrigin : true,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(sanitizeInput);

// Routing mounts
app.get('/', (req, res) => {
  res.send('Backend Running Successfully');
});
app.use('/health', healthRouter);
app.use('/api/users', authRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/friends', friendRouter);
app.use('/api/replays', replayRouter);
app.use('/api/shop', shopRouter);
app.use('/api/daily-rewards', dailyRouter);

// Fallback global error handler
app.use(errorHandler);

export default app;
