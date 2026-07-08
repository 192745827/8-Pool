import React from 'react';
interface PlayerCardProps {
    user?: {
        username: string;
        avatar: string;
        coins: number;
        xp: number;
        wins: number;
        losses: number;
        rank: string;
    } | null;
    isHost?: boolean;
    label?: string;
}
export declare const PlayerCard: React.FC<PlayerCardProps>;
export default PlayerCard;
//# sourceMappingURL=PlayerCard.d.ts.map