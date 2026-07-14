import { AuthoritativeGameState, createInitialGameState } from './GameState';
import PhysicsSync from './PhysicsSync';
import RuleSync from './RuleSync';

export class MatchManager {
  private state: AuthoritativeGameState;
  private hostUserId: string;
  private guestUserId: string;

  constructor(roomId: string, hostUserId: string, guestUserId: string) {
    this.state = createInitialGameState(roomId);
    this.hostUserId = hostUserId;
    this.guestUserId = guestUserId;
  }

  /**
   * Returns the current MatchState.
   */
  public getState(): AuthoritativeGameState {
    return this.state;
  }

  /**
   * Authoritatively executes a shot intent on the server.
   * Validates player turn, runs physics sync simulation, and executes rules checks.
   */
  public executeShot(
    userId: string,
    angle: number,
    power: number
  ): { state: AuthoritativeGameState; error?: string } {
    const activePlayerRole = this.state.activePlayer;
    const expectedUserId = activePlayerRole === 'host' ? this.hostUserId : this.guestUserId;

    // 1. Enforce active turn verification
    if (userId !== expectedUserId) {
      return {
        state: this.state,
        error: 'It is not your turn to shoot',
      };
    }

    if (this.state.status === 'game-over') {
      return {
        state: this.state,
        error: 'The match has already concluded',
      };
    }

    // Transition status to playing
    this.state.status = 'playing';

    // 2. Server-side physics simulation step
    const simulation = PhysicsSync.simulateShot(this.state, angle, power);

    // Apply coordinate updates
    this.state.balls = simulation.updatedBalls;

    // 3. Process rules outcomes (fouls, turn updates, wins)
    this.state = RuleSync.processShotResult(
      this.state,
      simulation.firstBallHit,
      simulation.pocketedBalls,
      simulation.isCueBallScratched,
      simulation.cushionHitsAfterContact
    );

    return { state: this.state };
  }
}
