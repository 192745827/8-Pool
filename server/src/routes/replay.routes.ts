import { Router, Response } from 'express';
import { protect } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth';
import { MatchReplay } from '../models/MatchReplay';

const router = Router();

// Apply auth middleware to all replay routes
router.use(protect);

/**
 * GET /api/replays
 * Fetch all saved match replays for current user
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const replays = await MatchReplay.find({
      $or: [{ host: userId }, { guest: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('host', 'username avatar rank wins xp')
      .populate('guest', 'username avatar rank wins xp')
      .populate('winnerUser', 'username avatar rank');

    res.json(replays);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch match replays' });
  }
});

/**
 * GET /api/replays/:replayId
 * Fetch specific match replay details with full shot log
 */
router.get('/:replayId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { replayId } = req.params;

    const replay = await MatchReplay.findById(replayId)
      .populate('host', 'username avatar rank wins xp')
      .populate('guest', 'username avatar rank wins xp')
      .populate('winnerUser', 'username avatar rank')
      .populate('shots.shooterId', 'username avatar rank');

    if (!replay) {
      res.status(404).json({ message: 'Match replay not found' });
      return;
    }

    res.json(replay);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch replay details' });
  }
});

export default router;
