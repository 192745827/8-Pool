import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Generates a signed JWT token containing the user's ID and username.
 */
export const generateToken = (userId: string, username: string): string => {
  const payload: TokenPayload = { userId, username };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};
