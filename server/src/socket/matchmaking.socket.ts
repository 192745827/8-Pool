import { Server, Socket } from 'socket.io';
import { User } from '../models/User';
import { createRoom, joinRoom } from '../services/room.service';

interface QueuePlayer {
  socketId: string;
  userId: string;
  username: string;
  avatar: string;
  eloRating: number;
  joinedAt: number;
}

let matchmakingQueue: QueuePlayer[] = [];
let queueInterval: NodeJS.Timeout | null = null;

export const registerMatchmakingHandlers = (io: Server, socket: Socket): void => {

  /**
   * Handle joining automated matchmaking queue
   */
  socket.on('join-matchmaking', async () => {
    try {
      const userId = (socket as any).userId;
      if (!userId) {
        socket.emit('matchmaking-error', { message: 'Authentication required' });
        return;
      }

      // Check if player is already queued
      const existingIdx = matchmakingQueue.findIndex((p) => p.userId === userId);
      if (existingIdx !== -1) {
        matchmakingQueue.splice(existingIdx, 1);
      }

      const user = await User.findById(userId);
      if (!user) {
        socket.emit('matchmaking-error', { message: 'User not found' });
        return;
      }

      const playerItem: QueuePlayer = {
        socketId: socket.id,
        userId: user._id.toString(),
        username: user.username,
        avatar: user.avatar,
        eloRating: user.eloRating || 1200,
        joinedAt: Date.now(),
      };

      matchmakingQueue.push(playerItem);

      socket.emit('searching-status', {
        status: 'searching',
        eloRating: playerItem.eloRating,
        queueCount: matchmakingQueue.length,
      });

      // Start queue processing loop if not already running
      if (!queueInterval) {
        queueInterval = setInterval(() => processQueue(io), 2000);
      }
    } catch (err: any) {
      console.error('Error joining matchmaking:', err);
      socket.emit('matchmaking-error', { message: 'Failed to join matchmaking' });
    }
  });

  /**
   * Handle leaving automated matchmaking queue
   */
  socket.on('leave-matchmaking', () => {
    const userId = (socket as any).userId;
    if (userId) {
      matchmakingQueue = matchmakingQueue.filter((p) => p.userId !== userId);
    } else {
      matchmakingQueue = matchmakingQueue.filter((p) => p.socketId !== socket.id);
    }
    socket.emit('searching-status', { status: 'cancelled' });
  });

  /**
   * Handle disconnects - remove from queue
   */
  socket.on('disconnect', () => {
    matchmakingQueue = matchmakingQueue.filter((p) => p.socketId !== socket.id);
  });
};

/**
 * Periodically pairs players in the matchmaking queue based on ELO proximity
 */
const processQueue = async (io: Server): Promise<void> => {
  if (matchmakingQueue.length < 2) {
    if (matchmakingQueue.length === 0 && queueInterval) {
      clearInterval(queueInterval);
      queueInterval = null;
    }
    return;
  }

  // Sort queue by ELO rating ascending
  matchmakingQueue.sort((a, b) => a.eloRating - b.eloRating);

  const matchedPairs: Array<[QueuePlayer, QueuePlayer]> = [];
  const matchedUserIds = new Set<string>();

  for (let i = 0; i < matchmakingQueue.length - 1; i++) {
    const playerA = matchmakingQueue[i];
    if (matchedUserIds.has(playerA.userId)) continue;

    for (let j = i + 1; j < matchmakingQueue.length; j++) {
      const playerB = matchmakingQueue[j];
      if (matchedUserIds.has(playerB.userId)) continue;

      const eloDiff = Math.abs(playerA.eloRating - playerB.eloRating);
      const waitTimeSec = (Date.now() - Math.min(playerA.joinedAt, playerB.joinedAt)) / 1000;
      
      // Expand ELO tolerance by 100 for every 5 seconds waited (base 150)
      const allowedEloDiff = 150 + Math.floor(waitTimeSec / 5) * 100;

      if (eloDiff <= allowedEloDiff) {
        matchedPairs.push([playerA, playerB]);
        matchedUserIds.add(playerA.userId);
        matchedUserIds.add(playerB.userId);
        break;
      }
    }
  }

  // Remove matched players from queue
  matchmakingQueue = matchmakingQueue.filter((p) => !matchedUserIds.has(p.userId));

  // Auto-create game rooms for paired players
  for (const [pA, pB] of matchedPairs) {
    try {
      const room = await createRoom(pA.userId, false);
      await joinRoom(room.roomId, pB.userId);

      // Notify player A
      io.to(pA.socketId).emit('match-found', {
        roomId: room.roomId,
        opponent: {
          username: pB.username,
          avatar: pB.avatar,
          eloRating: pB.eloRating,
        },
      });

      // Notify player B
      io.to(pB.socketId).emit('match-found', {
        roomId: room.roomId,
        opponent: {
          username: pA.username,
          avatar: pA.avatar,
          eloRating: pA.eloRating,
        },
      });
    } catch (err) {
      console.error('Failed to create room for matched players:', err);
    }
  }
};
