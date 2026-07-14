import socketService from '../../socket/socket';
import { SOCKET_EVENTS } from '../../socket/socketEvents';
import SocketGame from './SocketGame';

export class Reconnect {
  /**
   * Tracks connection losses and automatically requests a match sync payload when connection recovers.
   * Returns a cleanup callback function.
   */
  public static monitor(roomId: string, onReconnectAttempt?: () => void): () => void {
    const socket = socketService.getSocket();
    if (!socket) return () => {};

    const handleConnect = () => {
      console.log('🔄 Socket connected/reconnected. Querying server match state for room:', roomId);
      if (onReconnectAttempt) onReconnectAttempt();
      
      // Authoritatively request state restoration
      SocketGame.emitReconnect(roomId);
    };

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
    };
  }
}

export default Reconnect;
