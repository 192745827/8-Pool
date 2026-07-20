import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import { RANK_TIERS, getRankDetails, getRankProgress, getNextRankTier } from '../utils/rankUtils';

interface LeaderboardUser {
  _id: string;
  username: string;
  avatar: string;
  eloRating?: number;
  rank: string;
  wins: number;
  xp: number;
}

export const Rankings: React.FC = () => {
  const navigate = useNavigate();
  const user = useGameStore((state) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);

  const [topPlayers, setTopPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const currentElo = user?.eloRating || 1200;
  const currentRank = getRankDetails(currentElo);
  const progressPercent = getRankProgress(currentElo);
  const { nextTier, pointsNeeded } = getNextRankTier(currentElo);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }

    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/users/leaderboard');
      setTopPlayers(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load rankings leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-black pb-12">
      {/* Background Neon Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div ref={containerRef} className="relative z-10 max-w-5xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-400 to-pink-500">
              🏅 Competitive Ranking System
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Climb 6 competitive skill tiers from Bronze to Master based on your ELO rating.
            </p>
          </div>
        </div>

        {/* ACTIVE USER STANDING BANNER */}
        <div className="mb-8 p-6 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${currentRank.bgGradient} border-2 ${currentRank.borderColor} shadow-lg flex items-center justify-center text-4xl shrink-0`}>
                <span>{currentRank.icon}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-md border ${currentRank.badgeBg}`}>
                    {currentRank.name} Tier
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Your Standing</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  {user?.username || 'Player'}
                </h2>
                <p className="text-sm font-extrabold text-cyan-400 mt-0.5">
                  {currentElo} ELO Rating
                </p>
              </div>
            </div>

            {/* Tier Progress Bar */}
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{currentRank.name}</span>
                <span>{nextTier ? `${nextTier.name} (${nextTier.minElo} ELO)` : 'MAX RANK'}</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                {nextTier ? `${pointsNeeded} ELO points needed to promote` : '👑 Master Tier Reached!'}
              </p>
            </div>
          </div>
        </div>

        {/* 6 RANK TIERS LADDER */}
        <div className="mb-10 space-y-4">
          <h2 className="text-lg font-extrabold text-white tracking-wide">
            🏆 Competitive Rank Ladder (6 Tiers)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RANK_TIERS.map((tier) => {
              const isCurrent = currentRank.name === tier.name;

              return (
                <div
                  key={tier.name}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-[1.02]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-cyan-500 text-black rounded-full">
                      ACTIVE TIER
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{tier.icon}</span>
                      <div>
                        <h3 className={`text-lg font-extrabold ${tier.textColor}`}>
                          {tier.name} Tier
                        </h3>
                        <span className="text-xs font-bold text-slate-400">
                          {tier.maxElo >= 9999 ? `${tier.minElo}+ ELO` : `${tier.minElo} - ${tier.maxElo} ELO`}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {tier.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP MASTERS LEADERBOARD PREVIEW */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            👑 Top Ranked Masters Leaderboard
          </h3>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-500">Loading rankings...</div>
          ) : (
            <div className="space-y-2">
              {topPlayers.map((player, idx) => {
                const rankDetails = getRankDetails(player.eloRating || 1200);

                return (
                  <div
                    key={player._id}
                    className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-extrabold text-sm text-amber-400">
                        #{idx + 1}
                      </span>
                      <span className="text-xl">{player.avatar === 'avatar_1' ? '👤' : player.avatar}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{player.username}</p>
                        <span className={`text-[10px] font-bold ${rankDetails.textColor}`}>
                          {rankDetails.icon} {rankDetails.name} Tier
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-cyan-400">
                      {player.eloRating || 1200} ELO
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rankings;
