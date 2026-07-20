import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { Friend } from '../models/Friend';
import { RecentlyPlayed } from '../models/RecentlyPlayed';

// Map of userId -> Set of active Socket IDs
const onlineUsers = new Map<string, Set<string>>();

export const isUserOnline = (userId: string): boolean => {
  const sockets = onlineUsers.get(userId);
  return !!sockets && sockets.size > 0;
};

/**
 * Record a played match between two users for recently-played history
 */
export const recordMatchOpponents = async (user1Id: string, user2Id: string): Promise<void> => {
  try {
    if (!user1Id || !user2Id || user1Id === user2Id) return;

    // Upsert record for user1 -> user2
    await RecentlyPlayed.findOneAndUpdate(
      { user: user1Id, opponent: user2Id },
      { playedAt: new Date() },
      { upsert: true, new: true }
    );

    // Upsert record for user2 -> user1
    await RecentlyPlayed.findOneAndUpdate(
      { user: user2Id, opponent: user1Id },
      { playedAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Failed to record match opponents:', err);
  }
};

export const registerFriendHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const userId = socket.user?.id;
  const username = socket.user?.username;

  if (!userId) return;

  // Track socket connection
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  const userSockets = onlineUsers.get(userId)!;
  const wasOffline = userSockets.size === 0;
  userSockets.add(socket.id);

  // Notify friends if user just came online
  if (wasOffline) {
    notifyFriendsStatusChange(io, userId, true);
  }

  // Socket Disconnect handler
  socket.on('disconnect', () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        notifyFriendsStatusChange(io, userId, false);
      }
    }
  });

  // Handle direct friend invitation to a room
  socket.on('send-friend-invite', async (data: { targetUserId: string; roomId: string }) => {
    try {
      const { targetUserId, roomId } = data;
      if (!targetUserId || !roomId) return;

      const targetSockets = onlineUsers.get(targetUserId);
      if (targetSockets && targetSockets.size > 0) {
        targetSockets.forEach((targetSocketId) => {
          io.to(targetSocketId).emit('friend-invite-received', {
            inviterId: userId,
            inviterUsername: username,
            roomId,
          });
        });
      }
    } catch (err) {
      console.error('Error sending friend invite:', err);
    }
  });
};

// Broadcast online/offline status change to accepted friends
const notifyFriendsStatusChange = async (io: Server, userId: string, isOnline: boolean) => {
  try {
    const friendships = await Friend.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'accepted',
    });

    friendships.forEach((f) => {
      const friendId = f.user1.toString() === userId ? f.user2.toString() : f.user1.toString();
      const friendSockets = onlineUsers.get(friendId);
      if (friendSockets && friendSockets.size > 0) {
        friendSockets.forEach((sId) => {
          io.to(sId).emit('friend-status-change', { userId, isOnline });
        });
      }
    });
  } catch (err) {
    console.error('Error notifying friend status change:', err);
  }
};
