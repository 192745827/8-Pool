import React from 'react';
interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (roomId: string) => Promise<void>;
    isJoining?: boolean;
}
export declare const JoinRoomModal: React.FC<JoinRoomModalProps>;
export default JoinRoomModal;
//# sourceMappingURL=JoinRoomModal.d.ts.map