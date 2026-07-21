import { Request, Response, NextFunction } from 'express';

/**
 * Validates Auth Registration Payload
 */
export const validateRegisterInput = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    res.status(400).json({ message: 'Username must be at least 3 characters long' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    res.status(400).json({ message: 'Invalid email address format' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters long' });
    return;
  }

  next();
};

/**
 * Validates Auth Login Payload
 */
export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body;
  const identifier = email || username;

  if (!identifier || typeof identifier !== 'string' || identifier.trim().length < 3) {
    res.status(400).json({ message: 'Username or email address is required' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 1) {
    res.status(400).json({ message: 'Password is required' });
    return;
  }

  next();
};

/**
 * Sanitizes input body against XSS script tags & Mongo Operator Injection keys ($ and .)
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
};

const sanitizeObject = (obj: any) => {
  for (const key of Object.keys(obj)) {
    // Prevent Mongo operator injection ($where, $gt, etc.)
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }

    if (typeof obj[key] === 'string') {
      // Escape script tags and trim whitespace
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
};
