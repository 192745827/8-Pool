import React from 'react';
import { GameRoom, SharedUser } from '@pool/shared';

interface RoomCardProps {
  room: GameRoom;
  onJoin: (roomId: string) => void;
  isJoining?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, isJoining = false }) => {
  const host = typeof room.host === 'object' ? (room.host as SharedUser) : null;
  const guest = typeof room.guest === 'object' ? (room.guest as SharedUser) : null;
  
  const currentPlayersCount = (host ? 1 : 0) + (guest ? 1 : 0);
  const maxPlayersCount = room.maxPlayers || 2;

  return (
    <div className="p-5 bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl flex justify-between items-center hover:border-pool-cyan/40 transition duration-300">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/20 rounded-md tracking-wider">
            Public
          </span>
          <h4 className="text-sm font-bold font-display text-slate-400">
            Room Code: <span className="text-white text-base select-all">{room.roomId}</span>
          </h4>
        </div>
        <p className="text-xs font-body text-slate-400 mt-2">
          Host: <span className="text-slate-200 font-semibold">{host?.username || 'Unknown'}</span>
        </p>
        <p className="text-[10px] font-body text-slate-500 mt-1">
          Rank Limit: <span className="text-pool-cyan font-bold">{host?.rank || 'Beginner'}</span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="text-xs font-semibold text-slate-400 font-display flex items-center gap-1.5">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${currentPlayersCount < maxPlayersCount ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {currentPlayersCount} / {maxPlayersCount} Players
        </div>
        <button
          onClick={() => onJoin(room.roomId)}
          disabled={isJoining || currentPlayersCount >= maxPlayersCount}
          className={`py-2 px-4 font-display text-xs font-bold rounded-xl shadow-md transition-all duration-300 ${
            currentPlayersCount >= maxPlayersCount
              ? 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:shadow-lg hover:shadow-pool-cyan/15 hover:brightness-110 active:scale-95 text-pool-dark'
          }`}
        >
          {isJoining ? 'Joining...' : 'Join Room'}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
