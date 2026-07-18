import { MatchState } from './MatchState';
import BallAssignment from './BallAssignment';
import FoulDetector from './FoulDetector';
import WinManager from './WinManager';
import TurnManager from './TurnManager';

export class RuleEngine {
  /**
   * Processes the outcomes of a completed shot and returns the new MatchState.
   * Evaluates fouls, 8-ball pockets, group assignments, and switches or retains turns.
   */
  public static processShotResult(
    currentState: MatchState,
    activeBalls: number[],
    firstBallHit: number | null,
    pocketedBalls: number[],
    isCueBallScratched: boolean,
    cushionHitsAfterContact: number
  ): MatchState {
    // 1. Construct temporary shot result state on a fresh copy
    const nextState: MatchState = {
      ...currentState,
      firstBallHit,
      pocketedBallsInTurn: [...pocketedBalls],
      isCueBallScratched,
      cushionHitsAfterContact,
      foulOccurred: false,
      foulReason: null,
      ballInHand: currentState.ballInHand,
    };

    const activePlayer = currentState.activePlayer;
    const playerGroup = activePlayer === 'host' ? currentState.hostGroup : currentState.guestGroup;

    // 2. Run foul checks
    const foulCheck = FoulDetector.detectFoul(nextState, activeBalls, playerGroup);
    nextState.foulOccurred = foulCheck.foul;
    nextState.foulReason = foulCheck.reason;

    // 3. Evaluate 8-ball pocketing (victory/defeat)
    if (pocketedBalls.includes(8)) {
      const winCheck = WinManager.evaluate8BallPocketed(
        activePlayer,
        playerGroup,
        activeBalls,
        isCueBallScratched,
        nextState.foulOccurred,
        pocketedBalls
      );
      if (winCheck.gameEnded) {
        nextState.status = 'game-over';
        nextState.winner = winCheck.winner;
        nextState.foulReason = winCheck.reason;
        return nextState;
      }
    }

    // 4. Handle ball group assignments if table was open and shot was legal
    if (currentState.hostGroup === 'none' && !nextState.foulOccurred) {
      // Find the first pocketed object ball (1-7 or 9-15)
      const firstObj = pocketedBalls.find(
        (id) => BallAssignment.isSolid(id) || BallAssignment.isStripe(id)
      );
      if (firstObj !== undefined) {
        const assignments = BallAssignment.assignGroups(firstObj, activePlayer);
        nextState.hostGroup = assignments.hostGroup;
        nextState.guestGroup = assignments.guestGroup;
      }
    }

    // 5. Determine the next player turn
    // Resolve group details using the latest assignment
    const updatedGroup = activePlayer === 'host' ? nextState.hostGroup : nextState.guestGroup;
    const nextPlayer = TurnManager.determineNextTurn(
      activePlayer,
      updatedGroup,
      nextState.foulOccurred,
      pocketedBalls
    );

    nextState.activePlayer = currentState.isPractice ? 'host' : nextPlayer;
    nextState.isFirstShot = false;
    
    // Transition from break or normal play to playing state
    nextState.status = 'playing';

    // If the player committed a foul/scratch, the opponent starts their turn with ball in hand
    nextState.ballInHand = nextState.foulOccurred;

    return nextState;
  }
}

export default RuleEngine;
