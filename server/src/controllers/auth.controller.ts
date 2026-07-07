import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * Controller to handle user login and registration.
 * Route: POST /api/users
 */
export const handleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters long.' });
      return;
    }

    const { user, token } = await authService.loginOrRegister(username.trim());

    res.status(200).json({
      _id: user._id,
      username: user.username,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      createdAt: user.createdAt,
      token, // Return token inside payload for ease of integration
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during authentication' });
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
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during stats fetching' });
  }
};
