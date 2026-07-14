import { PlayerType, BallGroup } from './GameState';

export class TurnSync {
  public static SHOT_TIMEOUT_MS = 30000; // 30-second shot timeout limit

  /**
   * Resolves turn transitions authoritatively on the server.
   * Switches turn to opponent on fouls, scratches, or misses; active player retains turn on legal scores.
   */
  public static determineNextTurn(
    activePlayer: PlayerType,
    playerGroup: BallGroup,
    foulOccurred: boolean,
    pocketedBalls: number[]
  ): PlayerType {
    const opponent: PlayerType = activePlayer === 'host' ? 'guest' : 'host';

    // 1. Switch turn on any foul
    if (foulOccurred) {
      return opponent;
    }

    const pocketedObjectBalls = pocketedBalls.filter((id) => id !== 0 && id !== 8);

    // 2. Switch turn on misses (no object balls pocketed)
    if (pocketedObjectBalls.length === 0) {
      return opponent;
    }

    // 3. Open Table Rules
    if (playerGroup === 'none') {
      const containsValidObjectBall = pocketedObjectBalls.some(
        (id) => (id >= 1 && id <= 7) || (id >= 9 && id <= 15)
      );
      return containsValidObjectBall ? activePlayer : opponent;
    }

    // 4. Closed Table Rules
    const pocketedOwnGroupBall = pocketedObjectBalls.some((id) => {
      const isSolid = id >= 1 && id <= 7;
      const isStripe = id >= 9 && id <= 15;
      const ballGroup: BallGroup = isSolid ? 'solids' : isStripe ? 'stripes' : 'none';
      return ballGroup === playerGroup;
    });

    return pocketedOwnGroupBall ? activePlayer : opponent;
  }
}

export default TurnSync;
