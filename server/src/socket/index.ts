import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthenticatedSocket, SocketUser } from './socket.types';
import { registerRoomHandlers } from './room.socket';
import { registerChatHandlers } from './chat.socket';
import { registerGameHandlers } from './game.socket';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';

export const initSocketServer = (io: Server): void => {
  // Middleware to authenticate socket connections via JWT handshake token
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      // Handle bearer prefix if present
      const tokenString = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const decoded = jwt.verify(tokenString, JWT_SECRET) as any;
      
      socket.user = {
        id: decoded.userId,
        username: decoded.username,
      };
      
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Client connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Real-time player connected: ${socket.id} (User: ${socket.user?.username})`);

    // Register event domains
    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`🔌 Player disconnected: ${socket.id} (User: ${socket.user?.username})`);
    });
  });
};

export default initSocketServer;
