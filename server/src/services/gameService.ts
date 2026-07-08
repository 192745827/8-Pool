import { GameRoom } from '@pool/shared';

/**
 * Service to manage active game room lists on the backend.
 */
export class GameService {
  private activeRooms: Map<string, GameRoom> = new Map();

  createRoom(roomId: string): GameRoom {
    const newRoom: GameRoom = {
      roomId,
      host: '',
      guest: null,
      status: 'lobby',
      isPrivate: false,
      maxPlayers: 2,
    };
    this.activeRooms.set(roomId, newRoom);
    return newRoom;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.activeRooms.get(roomId);
  }

  deleteRoom(roomId: string): boolean {
    return this.activeRooms.delete(roomId);
  }
}

export const gameService = new GameService();
export default gameService;
