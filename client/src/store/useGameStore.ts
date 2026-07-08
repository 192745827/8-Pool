import { create } from 'zustand';
import { Player, GameRoom } from '@pool/shared';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  coins: number;
  xp: number;
  wins: number;
  losses: number;
  rank: string;
}

interface GameState {
  player: Player | null;
  user: UserProfile | null;
  currentRoom: GameRoom | null;
  setPlayer: (player: Player | null) => void;
  setUser: (user: UserProfile | null) => void;
  setRoom: (room: GameRoom | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  player: null,
  user: null,
  currentRoom: null,
  setPlayer: (player) => set({ player }),
  setUser: (user) => set({ user }),
  setRoom: (currentRoom) => set({ currentRoom }),
  reset: () => set({ player: null, user: null, currentRoom: null }),
}));
export default useGameStore;
