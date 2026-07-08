import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { User } from '../models/User';

export const registerChatHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const userId = socket.user?.id;
  const username = socket.user?.username;

  if (!userId || !username) return;

  socket.on('send-message', async (data: { roomId: string; message: string }) => {
    try {
      if (!data.roomId || !data.message.trim()) return;

      // Find user profile for avatar info
      const user = await User.findById(userId);
      const avatar = user?.avatar || 'avatar_1';

      const chatPayload = {
        roomId: data.roomId,
        senderId: userId,
        username,
        avatar,
        message: data.message.trim(),
        timestamp: new Date(),
      };

      // Broadcast message to everyone in the room
      io.to(data.roomId).emit('receive-message', chatPayload);
    } catch (err) {
      console.error('Error handling send-message socket event:', err);
    }
  });
};
export default registerChatHandlers;
