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

export const PlayerCard: React.FC<PlayerCardProps> = React.memo(({ user, isHost = false, label }) => {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/30 border border-white/5 border-dashed rounded-2xl min-h-[220px] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-pool-purple/5 to-transparent opacity-50 group-hover:opacity-85 transition-opacity" />
        <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center text-2xl text-slate-500 mb-4 animate-pulse relative z-10">
          ?
        </div>
        <div className="text-slate-400 font-display font-semibold tracking-wider text-sm mb-1 relative z-10">
          Waiting for Opponent...
        </div>
        <div className="text-slate-500 font-body text-xs relative z-10">
          Share your room code to start playing.
        </div>
      </div>
    );
  }

  const level = Math.floor(user.xp / 1000) + 1;
  const gamesPlayed = user.wins + user.losses;
  const winRate = gamesPlayed > 0 ? Math.round((user.wins / gamesPlayed) * 100) : 0;

  return (
    <div className="p-6 bg-slate-900/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col items-center min-h-[220px] hover:border-pool-cyan/35 transition-all duration-300 relative">
      <div className="absolute top-3 right-3 flex gap-1">
        {isHost && (
          <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-md">
            Host
          </span>
        )}
        {label && (
          <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-pool-cyan/15 border border-pool-cyan/30 text-pool-cyan rounded-md">
            {label}
          </span>
        )}
      </div>

      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pool-cyan/30 to-pool-purple/20 border border-pool-cyan/40 flex items-center justify-center text-3xl shadow-lg relative mb-4">
        <span className="select-none">
          {user.avatar === 'avatar_1' ? '👤' : user.avatar || '👤'}
        </span>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pool-cyan border border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-950 font-display">
          L{level}
        </div>
      </div>

      <h3 className="text-lg font-bold font-display text-white truncate max-w-full text-center">
        {user.username}
      </h3>
      <p className="text-xs font-semibold uppercase tracking-wider text-pool-cyan/80 mt-0.5 font-display">
        {user.rank}
      </p>

      <div className="grid grid-cols-3 gap-2 w-full mt-5 border-t border-white/5 pt-4 text-center">
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Coins</div>
          <div className="text-xs font-extrabold text-amber-400 font-display mt-0.5">
            🪙 {user.coins}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Record</div>
          <div className="text-xs font-extrabold text-white font-display mt-0.5">
            {user.wins}W - {user.losses}L
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Win Rate</div>
          <div className="text-xs font-extrabold text-emerald-400 font-display mt-0.5">
            {winRate}%
          </div>
        </div>
      </div>
    </div>
  );
});

export default PlayerCard;
