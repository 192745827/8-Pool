import { MatchState, INITIAL_MATCH_STATE } from './MatchState';
import RuleEngine from './RuleEngine';

export class GameManager {
  private state: MatchState;
  private firstBallHit: number | null = null;
  private pocketedBalls: number[] = [];
  private cushionHitsAfterContact = 0;

  // Callback to push state updates to the UI
  public onStateChange?: (state: MatchState) => void;

  constructor(initialState: MatchState = INITIAL_MATCH_STATE) {
    this.state = initialState;
  }

  /**
   * Returns the current MatchState.
   */
  public getState(): MatchState {
    return this.state;
  }

  /**
   * Resets the entire match to an initial state.
   */
  public resetGame(initialState: MatchState = INITIAL_MATCH_STATE): void {
    this.state = initialState;
    this.resetTurnStats();
    this.triggerStateChange();
  }

  /**
   * Prepares the game manager for a new shot.
   * Resets turn counters and clears temporary metrics.
   */
  public startNewShot(): void {
    this.resetTurnStats();
    this.state = {
      ...this.state,
      pocketedBallsInTurn: [],
      firstBallHit: null,
      cushionHitsAfterContact: 0,
      isCueBallScratched: false,
      foulOccurred: false,
      foulReason: null,
      ballInHand: false,
    };
    this.triggerStateChange();
  }

  /**
   * Manually deactivates ball-in-hand mode (called upon player confirmation).
   */
  public resetBallInHand(): void {
    this.state = {
      ...this.state,
      ballInHand: false,
    };
    this.triggerStateChange();
  }

  private resetTurnStats(): void {
    this.firstBallHit = null;
    this.pocketedBalls = [];
    this.cushionHitsAfterContact = 0;
  }

  /**
   * Records a collision between two balls.
   * Used to determine the first ball contacted by the cue ball.
   */
  public recordBallCollision(ball1: number, ball2: number): void {
    // Only record collisions involving the cue ball (ID 0)
    if (ball1 !== 0 && ball2 !== 0) return;

    const targetBall = ball1 === 0 ? ball2 : ball1;

    if (this.firstBallHit === null) {
      this.firstBallHit = targetBall;
    }
  }

  /**
   * Records a collision between a ball and a table cushion.
   * Tracks cushion contacts that occur AFTER the cue ball has contacted an object ball.
   */
  public recordCushionCollision(ballNumber: number): void {
    if (this.firstBallHit !== null) {
      this.cushionHitsAfterContact++;
    }
  }

  /**
   * Records when a ball is dropped into a pocket.
   */
  public recordBallPocketed(ballNumber: number): void {
    if (!this.pocketedBalls.includes(ballNumber)) {
      this.pocketedBalls.push(ballNumber);
    }
  }

  /**
   * Resolves the simulation once all ball motion stops.
   * Processes the shot results through the RuleEngine and transitions the state.
   */
  public endShotSimulation(activeBalls: number[], isCueBallScratched: boolean): MatchState {
    // Transition to turn-end state for rules evaluation
    this.state = {
      ...this.state,
      status: 'turn-end',
    };
    this.triggerStateChange();

    this.state = RuleEngine.processShotResult(
      this.state,
      activeBalls,
      this.firstBallHit,
      this.pocketedBalls,
      isCueBallScratched,
      this.cushionHitsAfterContact
    );

    this.resetTurnStats();
    this.triggerStateChange();
    return this.state;
  }

  /**
   * Authoritatively synchronizes local client state with the server game state.
   */
  public syncServerState(serverState: MatchState): void {
    this.state = {
      ...this.state,
      ...serverState,
    };
    this.triggerStateChange();
  }

  private triggerStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }
}

export default GameManager;
