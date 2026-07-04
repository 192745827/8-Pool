import { initialize8BallRack, BALL_TYPES } from '../../shared/physics.js';
import { GAME_STATES } from '../../shared/constants.js';

export class GameSession {
  constructor(roomId, player1, player2) {
    this.roomId = roomId;
    this.p1 = player1;
    this.p2 = player2;
    
    // Randomly choose who shoots first
    this.activePlayerId = Math.random() < 0.5 ? player1.id : player2.id;
    
    this.gameState = GAME_STATES.AIMING;
    this.balls = initialize8BallRack();
    
    // Track player assignments: null (undecided), 'SOLID', or 'STRIPE'
    this.playerAssignments = {
      [player1.id]: null,
      [player2.id]: null
    };

    // Track winner of the game
    this.winnerId = null;
    this.gameMessage = `${this.getActivePlayerName()}'s turn.`;
    
    // Scratch tracking
    this.isScratch = false;
  }

  getActivePlayerName() {
    return this.activePlayerId === this.p1.id ? this.p1.name : this.p2.name;
  }

  getOpponentId(playerId) {
    return playerId === this.p1.id ? this.p2.id : this.p1.id;
  }

  isPlayerTurn(playerId) {
    return this.activePlayerId === playerId && this.gameState === GAME_STATES.AIMING;
  }

  registerShot() {
    this.gameState = GAME_STATES.SHOOTING;
  }

  /**
   * Resolve the outcome of a turn based on client reports
   * @param {string} playerId - The ID of the player who shot
   * @param {Array} updatedBalls - Ball positions and pocketed statuses after shot animation finished
   * @param {Array} pocketedBallIds - IDs of balls pocketed during this shot
   */
  resolveTurnResult(playerId, updatedBalls, pocketedBallIds = []) {
    if (this.winnerId) {
      return this.getState();
    }

    // Sync positions
    this.balls = updatedBalls;

    const shooterId = playerId;
    const opponentId = this.getOpponentId(shooterId);
    
    // Detect what specific balls were pocketed
    const pocketedCue = pocketedBallIds.includes(0);
    const pocketed8Ball = pocketedBallIds.includes(8);
    
    const pocketedSolids = pocketedBallIds.filter(id => id > 0 && id < 8);
    const pocketedStripes = pocketedBallIds.filter(id => id > 8);

    console.log(`Turn result in room ${this.roomId}: cue=${pocketedCue}, 8ball=${pocketed8Ball}, solids=${pocketedSolids.length}, stripes=${pocketedStripes.length}`);

    // Check if cue ball was pocketed (Scratch)
    if (pocketedCue) {
      this.isScratch = true;
      // Respawn cue ball at initial position (or signal client to allow ball-in-hand)
      const cueBall = this.balls.find(b => b.id === 0);
      if (cueBall) {
        cueBall.isPocketed = false;
        cueBall.x = 200; // Reset position
        cueBall.y = 200;
        cueBall.vx = 0;
        cueBall.vy = 0;
      }
    } else {
      this.isScratch = false;
    }

    // Handle 8-Ball pocketed scenario
    if (pocketed8Ball) {
      this.gameState = GAME_STATES.GAME_OVER;
      
      // Winner check: did they clear their balls first?
      const shooterBallType = this.playerAssignments[shooterId];
      if (shooterBallType) {
        const remainingGroupBallsCount = this.balls.filter(b => 
          !b.isPocketed && 
          ((shooterBallType === 'SOLID' && b.type === BALL_TYPES.SOLID) ||
           (shooterBallType === 'STRIPE' && b.type === BALL_TYPES.STRIPE))
        ).length;

        if (remainingGroupBallsCount === 0 && !this.isScratch) {
          // Clean win
          this.winnerId = shooterId;
          this.gameMessage = `${this.getActivePlayerName()} cleared all balls and pocketed the 8-Ball! Game Over.`;
        } else {
          // Foul/early pocket: Lose
          this.winnerId = opponentId;
          this.gameMessage = `${this.getActivePlayerName()} pocketed the 8-Ball early or scratched! Opponent wins.`;
        }
      } else {
        // Table open and 8-ball pocketed = Lose
        this.winnerId = opponentId;
        this.gameMessage = `${this.getActivePlayerName()} pocketed the 8-Ball early! Opponent wins.`;
      }
      return this.getState();
    }

    // Handle Ball type assignment (if open table)
    let assignedThisTurn = false;
    if (this.playerAssignments[shooterId] === null && !this.isScratch) {
      if (pocketedSolids.length > 0 && pocketedStripes.length === 0) {
        this.playerAssignments[shooterId] = 'SOLID';
        this.playerAssignments[opponentId] = 'STRIPE';
        assignedThisTurn = true;
      } else if (pocketedStripes.length > 0 && pocketedSolids.length === 0) {
        this.playerAssignments[shooterId] = 'STRIPE';
        this.playerAssignments[opponentId] = 'SOLID';
        assignedThisTurn = true;
      } else if (pocketedSolids.length > 0 && pocketedStripes.length > 0) {
        // Both pocketed, table remains open, but shooter keeps turn
      }
    }

    // Determine if player gets to continue turn
    let nextPlayerId = opponentId;
    let turnMsg = "";

    const shooterType = this.playerAssignments[shooterId];
    let pocketedOwnBall = false;

    if (shooterType === 'SOLID' && pocketedSolids.length > 0) {
      pocketedOwnBall = true;
    } else if (shooterType === 'STRIPE' && pocketedStripes.length > 0) {
      pocketedOwnBall = true;
    } else if (shooterType === null && (pocketedSolids.length > 0 || pocketedStripes.length > 0)) {
      // Table is open, any pocketed ball allows turn continuation
      pocketedOwnBall = true;
    }

    if (this.isScratch) {
      nextPlayerId = opponentId;
      turnMsg = `Scratch! ${this.getPlayerName(opponentId)} gets Ball-In-Hand.`;
    } else if (pocketedOwnBall) {
      nextPlayerId = shooterId; // Keep turn
      turnMsg = assignedThisTurn 
        ? `${this.getPlayerName(shooterId)} assigned to ${shooterType}s! Extra turn.`
        : `${this.getPlayerName(shooterId)} pocketed a ball. Extra turn.`;
    } else {
      nextPlayerId = opponentId; // Switch turn
      turnMsg = `${this.getPlayerName(opponentId)}'s turn.`;
    }

    this.activePlayerId = nextPlayerId;
    this.gameState = GAME_STATES.AIMING;
    this.gameMessage = turnMsg;

    return this.getState();
  }

  getPlayerName(id) {
    return id === this.p1.id ? this.p1.name : this.p2.name;
  }

  getState() {
    return {
      gameState: this.gameState,
      balls: this.balls,
      activePlayerId: this.activePlayerId,
      playerAssignments: this.playerAssignments,
      winnerId: this.winnerId,
      gameMessage: this.gameMessage,
      isScratch: this.isScratch
    };
  }
}
