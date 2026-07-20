import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { User } from '../models/User';

interface OnlineUserEntry {
  userId: string;
  username: string;
  avatar: string;
  rank: string;
  socketId: string;
}

// Map of socketId -> OnlineUserEntry for global lobby presence
const globalChatUsers = new Map<string, OnlineUserEntry>();

const broadcastOnlineUsers = (io: Server) => {
  const usersList = Array.from(globalChatUsers.values()).map((u) => ({
    userId: u.userId,
    username: u.username,
    avatar: u.avatar,
    rank: u.rank,
  }));

  // Unique users list by userId
  const uniqueUsers = Array.from(
    new Map(usersList.map((item) => [item.userId, item])).values()
  );

  io.to('GLOBAL_LOBBY').emit('online-users', uniqueUsers);
};

export const registerChatHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const userId = socket.user?.id;
  const username = socket.user?.username;

  if (!userId || !username) return;

  // 1. JOIN GLOBAL CHAT
  socket.on('join-global-chat', async () => {
    try {
      socket.join('GLOBAL_LOBBY');

      const user = await User.findById(userId);
      const avatar = user?.avatar || 'avatar_1';
      const rank = user?.rank || 'Beginner';

      globalChatUsers.set(socket.id, {
        userId,
        username,
        avatar,
        rank,
        socketId: socket.id,
      });

      broadcastOnlineUsers(io);
    } catch (err) {
      console.error('Error joining global chat:', err);
    }
  });

  // 2. LEAVE GLOBAL CHAT
  socket.on('leave-global-chat', () => {
    socket.leave('GLOBAL_LOBBY');
    globalChatUsers.delete(socket.id);
    broadcastOnlineUsers(io);
  });

  // 3. SEND MESSAGE (GLOBAL LOBBY or ROOM)
  socket.on('send-message', async (data: { roomId: string; message: string; channel?: string }) => {
    try {
      const { roomId, message } = data;
      if (!roomId || !message.trim()) return;

      const user = await User.findById(userId);
      const avatar = user?.avatar || 'avatar_1';

      const chatPayload = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        roomId,
        senderId: userId,
        username,
        avatar,
        message: message.trim(),
        channel: data.channel || (roomId === 'GLOBAL_LOBBY' ? 'lobby' : 'game'),
        timestamp: new Date(),
      };

      if (roomId === 'GLOBAL_LOBBY') {
        io.to('GLOBAL_LOBBY').emit('receive-message', chatPayload);
      } else {
        io.to(roomId).emit('receive-message', chatPayload);
      }
    } catch (err) {
      console.error('Error in send-message event:', err);
    }
  });

  // 4. PRIVATE DIRECT MESSAGE
  socket.on('private-message', async (data: { targetUserId: string; message: string }) => {
    try {
      const { targetUserId, message } = data;
      if (!targetUserId || !message.trim()) return;

      const senderUser = await User.findById(userId);
      const avatar = senderUser?.avatar || 'avatar_1';

      const payload = {
        id: `dm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        senderId: userId,
        senderUsername: username,
        senderAvatar: avatar,
        recipientId: targetUserId,
        message: message.trim(),
        timestamp: new Date(),
      };

      // Emit to all sockets of target user
      const targetEntries = Array.from(globalChatUsers.values()).filter(
        (u) => u.userId === targetUserId
      );

      targetEntries.forEach((t) => {
        io.to(t.socketId).emit('receive-private-message', payload);
      });

      // Also echo to current sender socket
      socket.emit('receive-private-message', payload);
    } catch (err) {
      console.error('Error handling private-message event:', err);
    }
  });

  // 5. TYPING INDICATOR
  socket.on('typing', (data: { channel: 'lobby' | 'game' | 'private'; roomId?: string; recipientId?: string; isTyping: boolean }) => {
    const payload = {
      userId,
      username,
      channel: data.channel,
      isTyping: data.isTyping,
    };

    if (data.channel === 'lobby') {
      socket.to('GLOBAL_LOBBY').emit('typing', payload);
    } else if (data.channel === 'game' && data.roomId) {
      socket.to(data.roomId).emit('typing', payload);
    } else if (data.channel === 'private' && data.recipientId) {
      const targetEntries = Array.from(globalChatUsers.values()).filter(
        (u) => u.userId === data.recipientId
      );
      targetEntries.forEach((t) => {
        io.to(t.socketId).emit('typing', payload);
      });
    }
  });

  // 6. DISCONNECT CLEANUP
  socket.on('disconnect', () => {
    if (globalChatUsers.has(socket.id)) {
      globalChatUsers.delete(socket.id);
      broadcastOnlineUsers(io);
    }
  });
};

export default registerChatHandlers;
