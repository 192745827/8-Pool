import { RapierRigidBody } from '@react-three/rapier';
import { GameManager, MatchState } from '../rules';
import SocketGame from './SocketGame';
import GameSynchronizer from './GameSynchronizer';
import EventListeners, { MatchEventListeners } from './EventListeners';
import Reconnect from './Reconnect';
import audioManager from '../../audio/AudioManager';

export class MultiplayerManager {
  private roomId: string;
  private isHost: boolean;
  private gameManager: GameManager;
  private cleanupListeners: () => void = () => {};
  private cleanupMonitor: () => void = () => {};

  constructor(roomId: string, isHost: boolean, gameManager: GameManager) {
    this.roomId = roomId;
    this.isHost = isHost;
    this.gameManager = gameManager;
  }

  /**
   * Initializes WebSocket synchronizers, reconnect monitors, and active turn listeners.
   */
  public initialize(
    ballRefs: React.MutableRefObject<Map<number, RapierRigidBody>>,
    turnState: string,
    customListeners?: Partial<MatchEventListeners>
  ): void {
    this.cleanup();

    const mergedListeners: MatchEventListeners = {
      onStateUpdate: (serverState) => {
        GameSynchronizer.syncMatchState(serverState, this.gameManager);
        if ((serverState as any).balls) {
          GameSynchronizer.syncBalls((serverState as any).balls, turnState, ballRefs);
        }
      },
      onPlayerDisconnected: (data) => {
        console.warn('Opponent player disconnected:', data.message);
        audioManager.playFoul(); // Alert sound for player drop
      },
      onPlayerReconnected: (data) => {
        console.log('Opponent player reconnected:', data.message);
        audioManager.playPlayerConnected(); // Chime for rejoin
      },
      ...customListeners,
    };

    // 1. Subscribe to server broadcasts
    this.cleanupListeners = EventListeners.register(this.roomId, mergedListeners);

    // 2. Monitor transient network dropouts
    this.cleanupMonitor = Reconnect.monitor(this.roomId);
  }

  /**
   * Checks if it is the local player's turn to shoot.
   */
  public isLocalTurn(): boolean {
    const matchState = this.gameManager.getState();
    return (
      (this.isHost && matchState.activePlayer === 'host') ||
      (!this.isHost && matchState.activePlayer === 'guest')
    );
  }

  /**
   * Emits aiming rotation.
   */
  public aim(angle: number): void {
    SocketGame.emitAim(this.roomId, angle);
  }

  /**
   * Emits shot release coordinates.
   */
  public shoot(angle: number, power: number): void {
    SocketGame.emitShoot(this.roomId, angle, power);
  }

  /**
   * Closes active match room.
   */
  public endMatch(): void {
    SocketGame.emitEndMatch(this.roomId);
  }

  /**
   * Cleans up all listeners and monitors.
   */
  public cleanup(): void {
    this.cleanupListeners();
    this.cleanupMonitor();
  }
}

export default MultiplayerManager;
