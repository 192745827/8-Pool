import { Request, Response } from 'express';

/**
 * Controller callback for checking system status.
 */
export const getHealth = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
};
