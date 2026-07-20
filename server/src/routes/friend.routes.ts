import { Router, Response } from 'express';
import { protect } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth';
import { Friend } from '../models/Friend';
import { User } from '../models/User';
import { RecentlyPlayed } from '../models/RecentlyPlayed';
import { isUserOnline } from '../socket/friend.socket';

const router = Router();

// Apply auth middleware to all friend routes
router.use(protect);

/**
 * GET /api/friends
 * Fetch all accepted friends with online status
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const friendships = await Friend.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'accepted',
    })
      .populate('user1', 'username avatar rank wins losses xp coins')
      .populate('user2', 'username avatar rank wins losses xp coins');

    const friendsList = friendships.map((f) => {
      const u1 = f.user1 as any;
      const u2 = f.user2 as any;
      const friendUser = u1._id.toString() === userId ? u2 : u1;
      const online = isUserOnline(friendUser._id.toString());

      return {
        friendshipId: f._id,
        user: friendUser,
        isOnline: online,
        createdAt: f.createdAt,
      };
    });

    res.json(friendsList);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch friends' });
  }
});

/**
 * GET /api/friends/requests
 * Fetch pending incoming & outgoing friend requests
 */
router.get('/requests', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const pendingFriendships = await Friend.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'pending',
    })
      .populate('user1', 'username avatar rank')
      .populate('user2', 'username avatar rank')
      .populate('requester', 'username avatar rank');

    const incoming: any[] = [];
    const outgoing: any[] = [];

    pendingFriendships.forEach((f) => {
      const isOutgoing = f.requester._id.toString() === userId;
      const u1 = f.user1 as any;
      const u2 = f.user2 as any;
      const otherUser = u1._id.toString() === userId ? u2 : u1;

      const item = {
        requestId: f._id,
        user: otherUser,
        createdAt: f.createdAt,
      };

      if (isOutgoing) {
        outgoing.push(item);
      } else {
        incoming.push(item);
      }
    });

    res.json({ incoming, outgoing });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch requests' });
  }
});

/**
 * POST /api/friends/request
 * Send a friend request by target username or target userId
 */
router.post('/request', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { targetUsername, targetUserId } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let targetUser;
    if (targetUserId) {
      targetUser = await User.findById(targetUserId);
    } else if (targetUsername) {
      targetUser = await User.findOne({ username: targetUsername.trim() });
    }

    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (targetUser._id.toString() === userId) {
      res.status(400).json({ message: 'You cannot send a friend request to yourself' });
      return;
    }

    // Standardize user order (smaller ID first) to avoid duplicate pairs
    const [u1, u2] = [userId, targetUser._id.toString()].sort();

    let existing = await Friend.findOne({ user1: u1, user2: u2 });

    if (existing) {
      if (existing.status === 'accepted') {
        res.status(400).json({ message: 'You are already friends' });
        return;
      }
      if (existing.status === 'pending') {
        res.status(400).json({ message: 'Friend request is already pending' });
        return;
      }
      // If rejected previously, reset to pending
      existing.status = 'pending';
      existing.requester = userId as any;
      await existing.save();
      res.json({ message: 'Friend request sent', friendship: existing });
      return;
    }

    const newFriendship = new Friend({
      user1: u1,
      user2: u2,
      requester: userId,
      status: 'pending',
    });

    await newFriendship.save();
    res.status(201).json({ message: 'Friend request sent', friendship: newFriendship });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to send friend request' });
  }
});

/**
 * POST /api/friends/respond
 * Respond to a friend request ('accept' or 'reject')
 */
router.post('/respond', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { requestId, action } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!['accept', 'reject'].includes(action)) {
      res.status(400).json({ message: "Action must be 'accept' or 'reject'" });
      return;
    }

    const friendship = await Friend.findById(requestId);
    if (!friendship) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }

    // Ensure current user is NOT the requester (only the recipient can respond)
    if (friendship.requester.toString() === userId) {
      res.status(400).json({ message: 'You cannot respond to your own sent request' });
      return;
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      res.json({ message: 'Friend request accepted' });
    } else {
      friendship.status = 'rejected';
      await friendship.save();
      res.json({ message: 'Friend request rejected' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to respond to request' });
  }
});

/**
 * DELETE /api/friends/:friendId
 * Remove a friend
 */
router.delete('/:friendId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { friendId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const [u1, u2] = [userId, friendId].sort();
    await Friend.deleteOne({ user1: u1, user2: u2 });

    res.json({ message: 'Friend removed successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to remove friend' });
  }
});

/**
 * GET /api/friends/recently-played
 * Get recently played opponents
 */
router.get('/recently-played', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const recentMatches = await RecentlyPlayed.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(10)
      .populate('opponent', 'username avatar rank wins losses xp coins');

    res.json(recentMatches);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch recently played list' });
  }
});

/**
 * GET /api/friends/search-users?q=query
 * Search registered users by username
 */
router.get('/search-users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.json([]);
      return;
    }

    const users = await User.find({
      _id: { $ne: userId },
      username: { $regex: q.trim(), $options: 'i' },
    })
      .select('username avatar rank wins xp coins')
      .limit(10);

    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to search users' });
  }
});

export default router;
