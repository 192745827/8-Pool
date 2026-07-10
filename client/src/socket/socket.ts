import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from './socketEvents';

let socketURL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
if (socketURL.includes('localhost') && window.location.hostname !== 'localhost') {
  socketURL = socketURL.replace('localhost', window.location.hostname);
}

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(socketURL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('🔌 Connected to Socket.IO server:', this.socket?.id);
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('🔌 Socket disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket manually disconnected');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit "${event}": Socket is not initialized.`);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn(`⚠️ Cannot listen to "${event}": Socket is not initialized.`);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
