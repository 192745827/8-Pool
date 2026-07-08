import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './socketEvents';
const socketURL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
class SocketService {
    socket = null;
    connect(token) {
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
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('🔌 Socket manually disconnected');
        }
    }
    getSocket() {
        return this.socket;
    }
    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
        else {
            console.warn(`⚠️ Cannot emit "${event}": Socket is not initialized.`);
        }
    }
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
        else {
            console.warn(`⚠️ Cannot listen to "${event}": Socket is not initialized.`);
        }
    }
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}
export const socketService = new SocketService();
export default socketService;
