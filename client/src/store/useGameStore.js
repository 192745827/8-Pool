import { create } from 'zustand';
export const useGameStore = create((set) => ({
    player: null,
    user: null,
    currentRoom: null,
    setPlayer: (player) => set({ player }),
    setUser: (user) => set({ user }),
    setRoom: (currentRoom) => set({ currentRoom }),
    reset: () => set({ player: null, user: null, currentRoom: null }),
}));
export default useGameStore;
