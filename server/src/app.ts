import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import authRouter from './routes/auth.routes';
import roomRouter from './routes/room.routes';
import friendRouter from './routes/friend.routes';
import replayRouter from './routes/replay.routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

export const app = express();
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware configurations
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? corsOrigin : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing mounts
app.get('/', (req, res) => {
  res.send('Backend Running Successfully');
});
app.use('/health', healthRouter);
app.use('/api/users', authRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/friends', friendRouter);
app.use('/api/replays', replayRouter);

// Fallback global error handler
app.use(errorHandler);

export default app;
