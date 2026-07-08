import React from 'react';
import { GameRoom } from '@pool/shared';
interface RoomCardProps {
    room: GameRoom;
    onJoin: (roomId: string) => void;
    isJoining?: boolean;
}
export declare const RoomCard: React.FC<RoomCardProps>;
export default RoomCard;
//# sourceMappingURL=RoomCard.d.ts.map