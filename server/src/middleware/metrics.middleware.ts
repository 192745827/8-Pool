import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Performance Metrics Middleware measuring request duration and injecting X-Response-Time header
 */
export const performanceMetrics = (req: Request, res: Response, next: NextFunction) => {
  const startMs = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startMs;
    res.setHeader('X-Response-Time', `${durationMs}ms`);

    // Log telemetry for API calls
    if (req.originalUrl.startsWith('/api')) {
      logger.info('API Telemetry', {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip,
      });
    }
  });

  next();
};
