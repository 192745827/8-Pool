import { Player, GameRoom } from '@pool/shared';
interface GameState {
    player: Player | null;
    currentRoom: GameRoom | null;
    setPlayer: (player: Player | null) => void;
    setRoom: (room: GameRoom | null) => void;
    reset: () => void;
}
export declare const useGameStore: import("zustand").UseBoundStore<import("zustand").StoreApi<GameState>>;
export {};
//# sourceMappingURL=useGameStore.d.ts.map