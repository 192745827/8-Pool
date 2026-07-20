import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Detailed System Health Check Controller
 * Route: GET /health
 */
export const getHealth = (req: Request, res: Response): void => {
  const dbStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';
  const isDbHealthy = mongoose.connection.readyState === 1;

  const memoryUsage = process.memoryUsage();

  res.status(isDbHealthy ? 200 : 503).json({
    status: isDbHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbState,
      connected: isDbHealthy,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
    },
  });
};

/**
 * Lightweight Liveness Probe Controller
 * Route: GET /health/liveness
 */
export const getLiveness = (req: Request, res: Response): void => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
};

/**
 * Performance Metrics Controller
 * Route: GET /health/metrics
 */
export const getMetrics = (req: Request, res: Response): void => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    memory: memoryUsage,
    cpuUsage: process.cpuUsage(),
  });
};
