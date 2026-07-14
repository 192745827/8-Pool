import { AuthoritativeGameState, BallGroup, PlayerType } from './GameState';
import TurnSync from './TurnSync';

export class RuleSync {
  /**
   * Classifies a ball ID into a Solids or Stripes group.
   */
  public static getBallGroup(ballId: number): BallGroup {
    if (ballId >= 1 && ballId <= 7) return 'solids';
    if (ballId >= 9 && ballId <= 15) return 'stripes';
    return 'none';
  }

  /**
   * Evaluates if a player has pocketed all their assigned balls and can shoot the 8-ball.
   */
  public static isOnEightBall(state: AuthoritativeGameState, playerGroup: BallGroup): boolean {
    if (playerGroup === 'none') return false;
    const remainingBalls = state.balls.filter(
      (b) => b.isActive && b.id !== 0 && b.id !== 8 && this.getBallGroup(b.id) === playerGroup
    );
    return remainingBalls.length === 0;
  }

  /**
   * Enforces rules and checks shot results for fouls.
   */
  public static detectFoul(
    state: AuthoritativeGameState,
    firstBallHit: number | null,
    pocketedBalls: number[],
    isCueBallScratched: boolean,
    cushionHitsAfterContact: number,
    playerGroup: BallGroup
  ): { foul: boolean; reason: string | null } {
    // 1. Scratch
    if (isCueBallScratched) {
      return { foul: true, reason: 'Cue ball scratched' };
    }

    // 2. Failed contact
    if (firstBallHit === null) {
      return { foul: true, reason: 'Failed to contact any object ball' };
    }

    const firstHitGroup = this.getBallGroup(firstBallHit);
    const isShootingEightBall = this.isOnEightBall(state, playerGroup);

    // 3. Open table checks
    if (playerGroup === 'none') {
      if (firstBallHit === 8) {
        return { foul: true, reason: 'Hit the 8-ball first on an open table' };
      }
    } 
    // 4. Closed table checks
    else {
      if (isShootingEightBall) {
        if (firstBallHit !== 8) {
          return { foul: true, reason: 'Failed to hit the 8-ball first' };
        }
      } else {
        if (firstBallHit === 8) {
          return { foul: true, reason: 'Hit the 8-ball first' };
        }
        if (firstHitGroup !== playerGroup) {
          return { foul: true, reason: `Hit opponent's ball (${firstHitGroup}) first` };
        }
      }
    }

    // 5. Cushion Contact rule
    const ballWasPocketed = pocketedBalls.length > 0;
    if (!ballWasPocketed && cushionHitsAfterContact === 0) {
      return { foul: true, reason: 'No cushion contact after contact' };
    }

    return { foul: false, reason: null };
  }

  /**
   * Authoritatively updates match state based on shot parameters.
   */
  public static processShotResult(
    state: AuthoritativeGameState,
    firstBallHit: number | null,
    pocketedBalls: number[],
    isCueBallScratched: boolean,
    cushionHitsAfterContact: number
  ): AuthoritativeGameState {
    const nextState = { ...state };
    nextState.firstBallHit = firstBallHit;
    nextState.pocketedBallsInTurn = [...pocketedBalls];
    nextState.isCueBallScratched = isCueBallScratched;
    nextState.cushionHitsAfterContact = cushionHitsAfterContact;

    const activePlayer = state.activePlayer;
    const playerGroup = activePlayer === 'host' ? state.hostGroup : state.guestGroup;

    // 1. Evaluate Foul
    const foulResult = this.detectFoul(
      nextState,
      firstBallHit,
      pocketedBalls,
      isCueBallScratched,
      cushionHitsAfterContact,
      playerGroup
    );
    nextState.foulOccurred = foulResult.foul;
    nextState.foulReason = foulResult.reason;

    // 2. Evaluate 8-Ball Pocket win/loss
    if (pocketedBalls.includes(8)) {
      const opponent: PlayerType = activePlayer === 'host' ? 'guest' : 'host';
      nextState.status = 'game-over';

      if (playerGroup === 'none') {
        nextState.winner = opponent;
        nextState.foulReason = `${activePlayer} pocketed the 8-ball on an open table`;
      } else if (!this.isOnEightBall(state, playerGroup)) {
        nextState.winner = opponent;
        nextState.foulReason = `${activePlayer} pocketed the 8-ball early`;
      } else if (isCueBallScratched || nextState.foulOccurred) {
        nextState.winner = opponent;
        nextState.foulReason = `${activePlayer} pocketed the 8-ball but scratched/fouled`;
      } else {
        nextState.winner = activePlayer;
        nextState.foulReason = `${activePlayer} pocketed the 8-ball legally to win`;
      }
      return nextState;
    }

    // 3. Handle ball group assignments if table was open and shot was legal
    if (state.hostGroup === 'none' && !nextState.foulOccurred) {
      const firstObj = pocketedBalls.find((id) => id >= 1 && id <= 15 && id !== 8);
      if (firstObj !== undefined) {
        const pocketedGroup = this.getBallGroup(firstObj);
        if (pocketedGroup !== 'none') {
          const opponentGroup = pocketedGroup === 'solids' ? 'stripes' : 'solids';
          if (activePlayer === 'host') {
            nextState.hostGroup = pocketedGroup;
            nextState.guestGroup = opponentGroup;
          } else {
            nextState.hostGroup = opponentGroup;
            nextState.guestGroup = pocketedGroup;
          }
        }
      }
    }

    // 4. Resolve next player turn and ball in hand
    const updatedGroup = activePlayer === 'host' ? nextState.hostGroup : nextState.guestGroup;
    const nextPlayer = TurnSync.determineNextTurn(
      activePlayer,
      updatedGroup,
      nextState.foulOccurred,
      pocketedBalls
    );

    nextState.activePlayer = nextPlayer;
    nextState.isFirstShot = false;
    nextState.status = 'playing';
    nextState.ballInHand = nextState.foulOccurred;

    return nextState;
  }
}

export default RuleSync;
