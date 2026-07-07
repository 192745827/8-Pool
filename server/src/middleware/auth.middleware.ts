import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, TokenPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';

/**
 * Middleware to protect routes and verify the JWT authorization token.
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

      req.user = {
        id: decoded.userId,
        username: decoded.username,
      };

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
