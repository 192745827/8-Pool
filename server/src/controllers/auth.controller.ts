import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as authService from '../services/auth.service';

/**
 * Controller to handle new user registration.
 * Route: POST /api/users
 */
export const handleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters long.' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const { user, token } = await authService.registerUser(username.trim(), email.trim(), password);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      coins: user.coins,
      xp: user.xp,
      wins: user.wins,
      losses: user.losses,
      rank: user.rank,
      createdAt: user.createdAt,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error during registration' });
  }
};

/**
 * Controller to handle user login.
 * Route: POST /api/users/login
 */
export const handleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'Username or email is required.' });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }

    const { user, token } = await authService.loginUser(username.trim(), password);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      coins: user.coins,
      xp: user.xp,
      wins: user.wins,
      losses: user.losses,
      rank: user.rank,
      createdAt: user.createdAt,
      token,
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message || 'Error during login' });
    }
  }
};

/**
 * Controller to fetch player statistics by username.
 * Route: GET /api/users/:username
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username parameter is required' });
      return;
    }

    const user = await authService.getUserStats(username);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      coins: user.coins,
      xp: user.xp,
      wins: user.wins,
      losses: user.losses,
      rank: user.rank,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during stats fetching' });
  }
};

/**
 * Controller to fetch the authenticated user's profile.
 * Route: GET /api/users/me (Protected)
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized, no user payload found' });
      return;
    }

    const user = await authService.getUserStats(req.user.username);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      coins: user.coins,
      xp: user.xp,
      wins: user.wins,
      losses: user.losses,
      rank: user.rank,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during profile fetching' });
  }
};
