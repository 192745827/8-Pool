import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Authentication & Sensitive Endpoints (15 req per 15 min)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
  },
}) as any;

/**
 * General API Rate Limiter (200 req per 15 min)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 API requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many API requests from this IP address. Please slow down.',
  },
}) as any;
