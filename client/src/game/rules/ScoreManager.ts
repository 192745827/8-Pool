import { BallGroup } from './MatchState';
import BallAssignment from './BallAssignment';

export class ScoreManager {
  /**
   * Filters and returns all remaining balls on the table belonging to a specific group.
   */
  public static getRemainingBallsOfGroup(
    activeBalls: number[],
    group: BallGroup
  ): number[] {
    if (group === 'none') {
      return [];
    }

    return activeBalls.filter((ballId) => {
      // Exclude cue ball and 8-ball from normal group lists
      if (ballId === 0 || ballId === 8) {
        return false;
      }
      return BallAssignment.getBallGroup(ballId) === group;
    });
  }

  /**
   * Evaluates whether a player is eligible to shoot the 8-ball.
   * A player can shoot the 8-ball only if they have an assigned group and
   * all object balls of that group have been pocketed.
   */
  public static canPlayerShootEightBall(
    activeBalls: number[],
    group: BallGroup
  ): boolean {
    if (group === 'none') {
      return false;
    }
    const remaining = this.getRemainingBallsOfGroup(activeBalls, group);
    return remaining.length === 0;
  }
}

export default ScoreManager;
