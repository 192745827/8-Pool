import { create } from 'zustand';
export const useGameStore = create((set) => ({
    player: null,
    currentRoom: null,
    setPlayer: (player) => set({ player }),
    setRoom: (currentRoom) => set({ currentRoom }),
    reset: () => set({ player: null, currentRoom: null }),
}));
