import { Request, Response, NextFunction } from 'express';

/**
 * Global Express error handling middleware.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`Unhandled error: ${err.message}`);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
};

export default errorHandler;
