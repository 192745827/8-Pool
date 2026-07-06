import { create } from 'zustand';
import { Player, GameRoom } from '@pool/shared';

interface GameState {
  player: Player | null;
  currentRoom: GameRoom | null;
  setPlayer: (player: Player | null) => void;
  setRoom: (room: GameRoom | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  player: null,
  currentRoom: null,
  setPlayer: (player) => set({ player }),
  setRoom: (currentRoom) => set({ currentRoom }),
  reset: () => set({ player: null, currentRoom: null }),
}));
