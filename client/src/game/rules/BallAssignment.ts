import { BallGroup, PlayerType } from './MatchState';

export class BallAssignment {
  /**
   * Checks if a ball number is a solid (1-7)
   */
  public static isSolid(ballNumber: number): boolean {
    return ballNumber >= 1 && ballNumber <= 7;
  }

  /**
   * Checks if a ball number is a stripe (9-15)
   */
  public static isStripe(ballNumber: number): boolean {
    return ballNumber >= 9 && ballNumber <= 15;
  }

  /**
   * Returns the group group classification for a given ball number
   */
  public static getBallGroup(ballNumber: number): BallGroup {
    if (this.isSolid(ballNumber)) return 'solids';
    if (this.isStripe(ballNumber)) return 'stripes';
    return 'none';
  }

  /**
   * Assigns ball groups to the host and guest players based on the first legally pocketed ball.
   * Returns the new assignments for host and guest.
   */
  public static assignGroups(
    firstPocketedBall: number,
    activePlayer: PlayerType
  ): { hostGroup: BallGroup; guestGroup: BallGroup } {
    const pocketedGroup = this.getBallGroup(firstPocketedBall);
    
    if (pocketedGroup === 'none') {
      return { hostGroup: 'none', guestGroup: 'none' };
    }

    const opponentGroup = pocketedGroup === 'solids' ? 'stripes' : 'solids';

    if (activePlayer === 'host') {
      return {
        hostGroup: pocketedGroup,
        guestGroup: opponentGroup,
      };
    } else {
      return {
        hostGroup: opponentGroup,
        guestGroup: pocketedGroup,
      };
    }
  }
}

export default BallAssignment;
