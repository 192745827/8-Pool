import socketService from '../../socket/socket';
import { SOCKET_EVENTS } from '../../socket/socketEvents';
import { MatchState } from '../rules';

export interface MatchEventListeners {
  onAim?: (data: { userId: string; angle: number }) => void;
  onShoot?: (data: { angle: number; power: number }) => void;
  onStateUpdate?: (state: MatchState) => void;
  onPlayerDisconnected?: (data: { userId: string; message: string }) => void;
  onPlayerReconnected?: (data: { userId: string; message: string }) => void;
}

export class EventListeners {
  /**
   * Subscribes socket listeners to game updates and binds them to matching callbacks.
   * Returns a cleanup unsubscribe callback to prevent listener accumulation leaks.
   */
  public static register(roomId: string, listeners: MatchEventListeners): () => void {
    const socket = socketService.getSocket();
    if (!socket) return () => {};

    if (listeners.onAim) {
      socket.on(SOCKET_EVENTS.AIM, listeners.onAim);
    }
    if (listeners.onShoot) {
      socket.on(SOCKET_EVENTS.SHOOT, listeners.onShoot);
    }
    if (listeners.onStateUpdate) {
      socket.on(SOCKET_EVENTS.GAME_STATE_UPDATE, listeners.onStateUpdate);
    }
    if (listeners.onPlayerDisconnected) {
      socket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, listeners.onPlayerDisconnected);
    }
    if (listeners.onPlayerReconnected) {
      socket.on(SOCKET_EVENTS.PLAYER_RECONNECTED, listeners.onPlayerReconnected);
    }

    return () => {
      if (listeners.onAim) socket.off(SOCKET_EVENTS.AIM, listeners.onAim);
      if (listeners.onShoot) socket.off(SOCKET_EVENTS.SHOOT, listeners.onShoot);
      if (listeners.onStateUpdate) socket.off(SOCKET_EVENTS.GAME_STATE_UPDATE, listeners.onStateUpdate);
      if (listeners.onPlayerDisconnected) socket.off(SOCKET_EVENTS.PLAYER_DISCONNECTED, listeners.onPlayerDisconnected);
      if (listeners.onPlayerReconnected) socket.off(SOCKET_EVENTS.PLAYER_RECONNECTED, listeners.onPlayerReconnected);
    };
  }
}

export default EventListeners;
