import { PlayerType, BallGroup } from './MatchState';
import ScoreManager from './ScoreManager';

export class WinManager {
  /**
   * Evaluates if the match ends and determines the winner when the 8-ball is pocketed.
   */
  public static evaluate8BallPocketed(
    activePlayer: PlayerType,
    playerGroup: BallGroup,
    activeBalls: number[],
    isScratch: boolean,
    isFoul: boolean,
    pocketedInTurn: number[]
  ): { gameEnded: boolean; winner: PlayerType | null; reason: string | null } {
    const is8BallPocketed = pocketedInTurn.includes(8);

    if (!is8BallPocketed) {
      return { gameEnded: false, winner: null, reason: null };
    }

    const opponent: PlayerType = activePlayer === 'host' ? 'guest' : 'host';

    // 1. Table is open and 8-ball is pocketed -> Loss
    if (playerGroup === 'none') {
      return {
        gameEnded: true,
        winner: opponent,
        reason: `${activePlayer} pocketed the 8-ball on an open table`,
      };
    }

    const isOnEightBall = ScoreManager.canPlayerShootEightBall(activeBalls, playerGroup);

    // 2. Pocketed early (player still has group balls remaining) -> Loss
    if (!isOnEightBall) {
      return {
        gameEnded: true,
        winner: opponent,
        reason: `${activePlayer} pocketed the 8-ball early with remaining balls on the table`,
      };
    }

    // 3. Pocketed with a scratch/foul on the same shot -> Loss
    if (isScratch || isFoul) {
      return {
        gameEnded: true,
        winner: opponent,
        reason: `${activePlayer} pocketed the 8-ball but committed a foul/scratch`,
      };
    }

    // 4. Pocketed legally -> Win
    return {
      gameEnded: true,
      winner: activePlayer,
      reason: `${activePlayer} pocketed the 8-ball legally to win the match`,
    };
  }
}

export default WinManager;
