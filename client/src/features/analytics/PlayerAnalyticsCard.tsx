import React from 'react';

interface PlayerAnalyticsCardProps {
  totalMatches?: number;
  wins?: number;
  losses?: number;
  pottingAccuracy?: number;
  longestStreak?: number;
}

export const PlayerAnalyticsCard: React.FC<PlayerAnalyticsCardProps> = ({
  totalMatches = 48,
  wins = 32,
  losses = 16,
  pottingAccuracy = 84.5,
  longestStreak = 7,
}) => {
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <div className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md text-white max-w-md w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-pool-cyan/20 text-pool-cyan border border-pool-cyan/30 rounded-full">
            📈 PERFORMANCE TELEMETRY
          </span>
          <h3 className="text-xl font-black font-display text-white mt-1">
            Player Analytics
          </h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-display text-emerald-400">
            {winRate}%
          </span>
          <span className="text-[10px] text-slate-400 block font-display">WIN RATE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3 mb-6 overflow-hidden flex border border-white/5">
        <div
          style={{ width: `${winRate}%` }}
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
        />
        <div
          style={{ width: `${100 - winRate}%` }}
          className="bg-rose-500/40 h-full"
        />
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-display block uppercase">POTTING ACCURACY</span>
          <span className="text-lg font-black font-display text-pool-cyan">{pottingAccuracy}%</span>
        </div>

        <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-display block uppercase">BEST WIN STREAK</span>
          <span className="text-lg font-black font-display text-amber-400">🔥 {longestStreak} Matches</span>
        </div>

        <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-display block uppercase">VICTORIES / DEFEATS</span>
          <span className="text-sm font-black font-display text-white">{wins} W / {losses} L</span>
        </div>

        <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-display block uppercase">TOTAL MATCHES</span>
          <span className="text-sm font-black font-display text-slate-300">{totalMatches} Games</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerAnalyticsCard;
