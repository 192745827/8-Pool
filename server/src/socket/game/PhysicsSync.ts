import { AuthoritativeGameState, BallState } from './GameState';

export class PhysicsSync {
  /**
   * Authoritatively simulates the shot on the server.
   * Takes the match state and shot information, applies impulses,
   * updates the positions, and returns the list of pocketed balls
   * and cushion hit statistics.
   */
  public static simulateShot(
    state: AuthoritativeGameState,
    angle: number,
    power: number
  ): {
    updatedBalls: BallState[];
    pocketedBalls: number[];
    firstBallHit: number | null;
    cushionHitsAfterContact: number;
    isCueBallScratched: boolean;
  } {
    // Authoritative Server Physics Simulation.
    // In a fully deployed setup, this wraps Rapier (Rapier3D WASM) to step the physics frames.
    // In this framework, it computes a simulated outcome to drive the state machine rules.
    
    const updatedBalls = state.balls.map((b) => ({ ...b }));
    const pocketedBalls: number[] = [];
    let firstBallHit: number | null = null;
    let cushionHitsAfterContact = 0;
    let isCueBallScratched = false;

    // Simulate outcome based on shot vector parameters
    if (power > 0) {
      const activeObjectBalls = state.balls.filter((b) => b.isActive && b.id !== 0);
      
      // Determine the first contacted ball (mocking closest target ball in path)
      if (activeObjectBalls.length > 0) {
        firstBallHit = activeObjectBalls[0].id;
      }

      // Simulate pocketing an object ball under medium-high power
      if (power > 40 && activeObjectBalls.length > 0) {
        const pocketedId = activeObjectBalls[0].id; // Pocket closest ball
        pocketedBalls.push(pocketedId);
        
        const bState = updatedBalls.find((b) => b.id === pocketedId);
        if (bState) {
          bState.isActive = false;
        }
      }

      // Simulate scratch chance at very high power
      if (power > 85 && Math.random() > 0.6) {
        isCueBallScratched = true;
        pocketedBalls.push(0);
        const cueState = updatedBalls.find((b) => b.id === 0);
        if (cueState) {
          cueState.x = -2.5; // Reset back to spawn positions
          cueState.z = 0;
        }
      }

      // Mock cushion rail contacts
      if (firstBallHit !== null) {
        cushionHitsAfterContact = Math.max(1, Math.floor(power / 25));
      }
    }

    return {
      updatedBalls,
      pocketedBalls,
      firstBallHit,
      cushionHitsAfterContact,
      isCueBallScratched,
    };
  }
}

export default PhysicsSync;
