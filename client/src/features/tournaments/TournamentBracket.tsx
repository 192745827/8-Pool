import React from 'react';

export interface TournamentPlayer {
  id: string;
  name: string;
  avatar: string;
  score?: number;
  winner?: boolean;
}

export interface TournamentMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final';
  player1: TournamentPlayer;
  player2: TournamentPlayer;
}

interface TournamentBracketProps {
  tournamentTitle?: string;
  prizePool?: number;
  matches?: TournamentMatch[];
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentTitle = "ULTRA 8-POOL CHAMPIONSHIP",
  prizePool = 50000,
}) => {
  const defaultQuarterMatches: TournamentMatch[] = [
    {
      id: 'q1',
      round: 'quarter',
      player1: { id: 'p1', name: 'Shark88', avatar: '🦈', score: 3, winner: true },
      player2: { id: 'p2', name: 'CueMaster', avatar: '🎱', score: 1 },
    },
    {
      id: 'q2',
      round: 'quarter',
      player1: { id: 'p3', name: 'VectorPro', avatar: '🎯', score: 2 },
      player2: { id: 'p4', name: 'NeonStriker', avatar: '⚡', score: 3, winner: true },
    },
    {
      id: 'q3',
      round: 'quarter',
      player1: { id: 'p5', name: 'SpinKing', avatar: '👑', score: 3, winner: true },
      player2: { id: 'p6', name: 'BreakLegend', avatar: '🔥', score: 0 },
    },
    {
      id: 'q4',
      round: 'quarter',
      player1: { id: 'p7', name: 'ShadowShot', avatar: '👤', score: 1 },
      player2: { id: 'p8', name: 'GoldenBall', avatar: '🌟', score: 3, winner: true },
    },
  ];

  return (
    <div className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-white/10 pb-4">
        <div>
          <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
            🏆 8-PLAYER KNOCKOUT BRACKET
          </span>
          <h3 className="text-2xl font-black font-display text-white mt-2 tracking-wide">
            {tournamentTitle}
          </h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
          <span className="text-amber-400 font-extrabold text-sm font-display">
            PRIZE POOL: 🪙 {prizePool.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bracket Tree */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Round 1: Quarter Finals */}
        <div className="space-y-4">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 block mb-2">
            Quarter Finals (BO3)
          </span>
          {defaultQuarterMatches.map((match) => (
            <div key={match.id} className="p-3 bg-slate-950/80 border border-white/10 rounded-xl shadow-md">
              <div className={`flex items-center justify-between p-2 rounded-lg ${match.player1.winner ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300'}`}>
                <div className="flex items-center gap-2">
                  <span>{match.player1.avatar}</span>
                  <span className="text-xs font-display">{match.player1.name}</span>
                </div>
                <span className="text-xs font-mono font-bold">{match.player1.score}</span>
              </div>
              <div className={`flex items-center justify-between p-2 rounded-lg mt-1 ${match.player2.winner ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300'}`}>
                <div className="flex items-center gap-2">
                  <span>{match.player2.avatar}</span>
                  <span className="text-xs font-display">{match.player2.name}</span>
                </div>
                <span className="text-xs font-mono font-bold">{match.player2.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Round 2: Semi Finals */}
        <div className="space-y-4 my-auto">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 block mb-2">
            Semi Finals (BO5)
          </span>
          <div className="p-3 bg-slate-950/80 border border-amber-500/20 rounded-xl shadow-md">
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold">
              <div className="flex items-center gap-2">
                <span>🦈</span>
                <span className="text-xs font-display">Shark88</span>
              </div>
              <span className="text-xs font-mono font-bold">3</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg mt-1 text-slate-400">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="text-xs font-display">NeonStriker</span>
              </div>
              <span className="text-xs font-mono font-bold">2</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-amber-500/20 rounded-xl shadow-md">
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold">
              <div className="flex items-center gap-2">
                <span>👑</span>
                <span className="text-xs font-display">SpinKing</span>
              </div>
              <span className="text-xs font-mono font-bold">3</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg mt-1 text-slate-400">
              <div className="flex items-center gap-2">
                <span>🌟</span>
                <span className="text-xs font-display">GoldenBall</span>
              </div>
              <span className="text-xs font-mono font-bold">1</span>
            </div>
          </div>
        </div>

        {/* Round 3: Championship Finals */}
        <div className="my-auto">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-amber-400 block mb-2 text-center">
            🏆 Championship Finals (BO7)
          </span>
          <div className="p-4 bg-gradient-to-b from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/40 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/30 text-amber-200 font-black mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🦈</span>
                <span className="text-sm font-display">Shark88</span>
              </div>
              <span className="text-sm font-mono font-extrabold">4</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <span className="text-sm font-display">SpinKing</span>
              </div>
              <span className="text-sm font-mono font-extrabold">2</span>
            </div>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 rounded-full">
                👑 CHAMPION: Shark88
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
