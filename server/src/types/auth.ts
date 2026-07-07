import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}
