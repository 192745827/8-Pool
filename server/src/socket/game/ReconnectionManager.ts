export class ReconnectionManager {
  private static instance: ReconnectionManager | null = null;
  
  // Maps userId to active match room and connection mappings
  private activeConnections: Map<string, { roomId: string; socketId: string; disconnectTime?: number }> = new Map();

  private constructor() {
    // Singleton constructor
  }

  public static getInstance(): ReconnectionManager {
    if (!ReconnectionManager.instance) {
      ReconnectionManager.instance = new ReconnectionManager();
    }
    return ReconnectionManager.instance;
  }

  /**
   * Registers a player connection details in a match room.
   */
  public registerPlayer(userId: string, roomId: string, socketId: string): void {
    this.activeConnections.set(userId, { roomId, socketId });
  }

  /**
   * Cleans up player mapping when the match is closed.
   */
  public removePlayer(userId: string): void {
    this.activeConnections.delete(userId);
  }

  /**
   * Checks if player is mapped to an active room.
   */
  public getPlayerRoom(userId: string): string | null {
    const entry = this.activeConnections.get(userId);
    return entry ? entry.roomId : null;
  }

  /**
   * Marks a disconnect time, starting the grace reconnect window.
   */
  public handleDisconnect(userId: string): void {
    const entry = this.activeConnections.get(userId);
    if (entry) {
      entry.disconnectTime = Date.now();
    }
  }

  /**
   * Handles player reconnection, returning room ID to sync if valid.
   */
  public handleReconnect(userId: string, socketId: string): string | null {
    const entry = this.activeConnections.get(userId);
    if (entry) {
      entry.socketId = socketId;
      entry.disconnectTime = undefined;
      return entry.roomId;
    }
    return null;
  }
}

export const reconnectionManager = ReconnectionManager.getInstance();
export default reconnectionManager;
