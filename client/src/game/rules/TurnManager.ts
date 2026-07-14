import { PlayerType, BallGroup } from './MatchState';
import BallAssignment from './BallAssignment';

export class TurnManager {
  /**
   * Evaluates turn resolution and determines who shoots next.
   * If the current player pockets a valid target ball legally, they retain the turn.
   * Otherwise, the turn switches to the opponent.
   */
  public static determineNextTurn(
    activePlayer: PlayerType,
    playerGroup: BallGroup,
    foulOccurred: boolean,
    pocketedBalls: number[]
  ): PlayerType {
    const opponent: PlayerType = activePlayer === 'host' ? 'guest' : 'host';

    // 1. Turn switches on any foul
    if (foulOccurred) {
      return opponent;
    }

    // Filter out the cue ball (0) and 8-ball (8) for normal turn progression checks
    const pocketedObjectBalls = pocketedBalls.filter((id) => id !== 0 && id !== 8);

    // If no object balls were pocketed, the turn switches
    if (pocketedObjectBalls.length === 0) {
      return opponent;
    }

    // 2. Open Table Rules
    if (playerGroup === 'none') {
      // Pocketing any valid object ball (1-7 or 9-15) legally keeps the turn
      const containsValidObjectBall = pocketedObjectBalls.some(
        (id) => BallAssignment.isSolid(id) || BallAssignment.isStripe(id)
      );
      return containsValidObjectBall ? activePlayer : opponent;
    }

    // 3. Closed Table Rules
    // Player retains the turn if they pocketed at least one ball of their own group
    const pocketedOwnGroupBall = pocketedObjectBalls.some(
      (id) => BallAssignment.getBallGroup(id) === playerGroup
    );

    return pocketedOwnGroupBall ? activePlayer : opponent;
  }
}

export default TurnManager;
