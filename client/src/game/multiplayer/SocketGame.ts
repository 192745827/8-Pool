import socketService from '../../socket/socket';
import { SOCKET_EVENTS } from '../../socket/socketEvents';

export class SocketGame {
  /**
   * Emits aiming angle updates to opponent in real-time.
   */
  public static emitAim(roomId: string, angle: number): void {
    socketService.emit(SOCKET_EVENTS.AIM, { roomId, angle });
  }

  /**
   * Emits shot release impulses to server.
   */
  public static emitShoot(roomId: string, angle: number, power: number): void {
    socketService.emit(SOCKET_EVENTS.SHOOT, { roomId, angle, power });
  }

  /**
   * Emits end match termination to close active match sessions.
   */
  public static emitEndMatch(roomId: string): void {
    socketService.emit(SOCKET_EVENTS.END_MATCH, { roomId });
  }

  /**
   * Emits reconnection request to server.
   */
  public static emitReconnect(roomId: string): void {
    socketService.emit(SOCKET_EVENTS.RECONNECT_MATCH, { roomId });
  }
}

export default SocketGame;
