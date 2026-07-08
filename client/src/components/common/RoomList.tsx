import React from 'react';
import { GameRoom } from '@pool/shared';
import RoomCard from './RoomCard';

interface RoomListProps {
  rooms: GameRoom[];
  onJoin: (roomId: string) => void;
  joiningRoomId?: string | null;
  onRefresh?: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  onJoin,
  joiningRoomId = null,
  onRefresh,
}) => {
  if (rooms.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/40 border border-white/5 rounded-2xl">
        <span className="text-3xl block mb-3 select-none">🕳️</span>
        <h4 className="text-sm font-bold font-display text-white">No Public Rooms Available</h4>
        <p className="text-xs text-slate-500 font-body mt-2 leading-relaxed max-w-[260px] mx-auto">
          All rooms are currently full or set to private. Create your own room to start!
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition duration-300 font-display"
          >
            🔄 Refresh List
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rooms.map((room) => (
        <RoomCard
          key={room.roomId}
          room={room}
          onJoin={onJoin}
          isJoining={joiningRoomId === room.roomId}
        />
      ))}
    </div>
  );
};

export default RoomList;
