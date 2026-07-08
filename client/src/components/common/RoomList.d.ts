import React from 'react';
import { GameRoom } from '@pool/shared';
interface RoomListProps {
    rooms: GameRoom[];
    onJoin: (roomId: string) => void;
    joiningRoomId?: string | null;
    onRefresh?: () => void;
}
export declare const RoomList: React.FC<RoomListProps>;
export default RoomList;
//# sourceMappingURL=RoomList.d.ts.map