import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-key-for-development-only';

/**
 * Generates a signed short-lived Access Token (15m expiration)
 */
export const generateAccessToken = (userId: string, username: string): string => {
  const payload: TokenPayload = { userId, username };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Generates a signed long-lived Refresh Token (7d expiration)
 */
export const generateRefreshToken = (userId: string, username: string): string => {
  const payload: TokenPayload = { userId, username };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Legacy Token Generator (30d)
 */
export const generateToken = (userId: string, username: string): string => {
  const payload: TokenPayload = { userId, username };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  });
};
