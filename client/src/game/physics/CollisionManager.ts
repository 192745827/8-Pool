import { CollisionPayload } from '@react-three/rapier';

export class CollisionManager {
  private static instance: CollisionManager | null = null;
  private lastPlayTime: Record<string, number> = {};
  private soundCache: Record<string, HTMLAudioElement> = {};

  // Callback hooks for the application to bind custom audio play logic
  public onPlaySound?: (type: 'ball-ball' | 'ball-cushion', volume: number) => void;

  // Callback hooks for the gameplay rules evaluation
  public onCollisionEvent?: (ball1: number, ball2: number | 'cushion') => void;

  private constructor() {
    // Private constructor for Singleton pattern
  }

  public static getInstance(): CollisionManager {
    if (!CollisionManager.instance) {
      CollisionManager.instance = new CollisionManager();
    }
    return CollisionManager.instance;
  }

  /**
   * Processes a collision event between bodies, calculates the impact force,
   * and plays the appropriate audio response.
   */
  public handleCollision(event: CollisionPayload, type: 'ball-ball' | 'ball-cushion') {
    // Dispatch collision event callback for gameplay rules
    if (this.onCollisionEvent) {
      const body1 = event.target.rigidBodyObject;
      const body2 = event.other.rigidBodyObject;
      const ballId1 = body1?.userData?.ballId;
      if (typeof ballId1 === 'number') {
        if (type === 'ball-ball') {
          const ballId2 = body2?.userData?.ballId;
          if (typeof ballId2 === 'number') {
            this.onCollisionEvent(ballId1, ballId2);
          }
        } else {
          this.onCollisionEvent(ballId1, 'cushion');
        }
      }
    }

    const now = Date.now();
    const key = `${type}-${event.target.rigidBody?.handle}-${event.other.rigidBody?.handle}`;

    // Throttle high-frequency repeat collisions (e.g. ball grinding against a rail)
    if (this.lastPlayTime[key] && now - this.lastPlayTime[key] < 120) {
      return;
    }
    this.lastPlayTime[key] = now;

    // Calculate relative impact velocity magnitude
    const vel1 = event.target.rigidBody?.linvel();
    const vel2 = event.other.rigidBody?.linvel();

    let relativeSpeed = 0;
    if (vel1) {
      const vx1 = vel1.x;
      const vy1 = vel1.y;
      const vz1 = vel1.z;

      const vx2 = vel2 ? vel2.x : 0;
      const vy2 = vel2 ? vel2.y : 0;
      const vz2 = vel2 ? vel2.z : 0;

      const rvx = vx1 - vx2;
      const rvy = vy1 - vy2;
      const rvz = vz1 - vz2;

      relativeSpeed = Math.sqrt(rvx * rvx + rvy * rvy + rvz * rvz);
    }

    // Ignore extremely tiny micro-collisions
    if (relativeSpeed < 0.1) {
      return;
    }

    // Map the relative speed (0.1 to 8.0 m/s range) to a 0.0 to 1.0 volume scale
    const volume = Math.min(Math.max((relativeSpeed - 0.1) / 5.0, 0.0), 1.0);

    // Trigger external custom sound system (e.g. playing synthesizers or Audio elements)
    if (this.onPlaySound) {
      this.onPlaySound(type, volume);
    } else {
      // Fallback console log for debugging physics auditory feedback
      console.log(`🔊 [Audio Physics] Play "${type}" collision sound at volume: ${(volume * 100).toFixed(0)}%`);
    }
  }
}

export const collisionManager = CollisionManager.getInstance();
export default collisionManager;
