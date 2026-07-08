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
export declare const useGameStore: import("zustand").UseBoundStore<import("zustand").StoreApi<GameState>>;
export default useGameStore;
//# sourceMappingURL=useGameStore.d.ts.map