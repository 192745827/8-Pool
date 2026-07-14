import { MatchManager } from './MatchManager';

export class GameRoomManager {
  private static instance: GameRoomManager | null = null;
  
  // Maps roomId to stateful MatchManagers
  private activeMatches: Map<string, MatchManager> = new Map();

  private constructor() {
    // Singleton constructor
  }

  public static getInstance(): GameRoomManager {
    if (!GameRoomManager.instance) {
      GameRoomManager.instance = new GameRoomManager();
    }
    return GameRoomManager.instance;
  }

  /**
   * Initializes and stores a new MatchManager instance for a room code.
   */
  public createMatch(roomId: string, hostUserId: string, guestUserId: string): MatchManager {
    const match = new MatchManager(roomId, hostUserId, guestUserId);
    this.activeMatches.set(roomId.trim().toUpperCase(), match);
    return match;
  }

  /**
   * Retrieves the MatchManager mapped to a room code.
   */
  public getMatch(roomId: string): MatchManager | undefined {
    return this.activeMatches.get(roomId.trim().toUpperCase());
  }

  /**
   * Deletes the match instance when match sessions conclude or close.
   */
  public endMatch(roomId: string): boolean {
    return this.activeMatches.delete(roomId.trim().toUpperCase());
  }
}

export const gameRoomManager = GameRoomManager.getInstance();
export default gameRoomManager;
