import { MatchState, BallGroup } from './MatchState';
import BallAssignment from './BallAssignment';
import ScoreManager from './ScoreManager';

export class FoulDetector {
  /**
   * Evaluates if a foul occurred based on the shot results and current state.
   */
  public static detectFoul(
    state: MatchState,
    activeBalls: number[],
    playerGroup: BallGroup
  ): { foul: boolean; reason: string | null } {
    // 1. Cue Ball Scratch
    if (state.isCueBallScratched) {
      return { foul: true, reason: 'Cue ball scratched' };
    }

    // 2. Failed to contact any object ball
    if (state.firstBallHit === null) {
      return { foul: true, reason: 'Failed to hit any object ball' };
    }

    const firstHitGroup = BallAssignment.getBallGroup(state.firstBallHit);
    const isOnEightBall = ScoreManager.canPlayerShootEightBall(activeBalls, playerGroup);

    // 3. Open Table Rules
    if (playerGroup === 'none') {
      // Cannot hit the 8-ball first when table is open
      if (state.firstBallHit === 8) {
        return { foul: true, reason: 'Hit the 8-ball first on an open table' };
      }
    } 
    // 4. Closed Table Rules
    else {
      if (isOnEightBall) {
        // Player is on the 8-ball, must hit it first
        if (state.firstBallHit !== 8) {
          return { foul: true, reason: 'Failed to hit the 8-ball first' };
        }
      } else {
        // Player is not on the 8-ball, must hit a ball of their own group first
        if (state.firstBallHit === 8) {
          return { foul: true, reason: 'Hit the 8-ball first' };
        }
        if (firstHitGroup !== playerGroup) {
          return { foul: true, reason: `Hit opponent's ball (${firstHitGroup}) first` };
        }
      }
    }

    // 5. Cushion Contact Rule
    // WPA: After the cue ball contacts a target ball, some ball must either be pocketed or make contact with a cushion.
    const ballWasPocketed = state.pocketedBallsInTurn.length > 0;
    if (!ballWasPocketed && state.cushionHitsAfterContact === 0) {
      return { foul: true, reason: 'No cushion contact after impact' };
    }

    return { foul: false, reason: null };
  }
}

export default FoulDetector;
