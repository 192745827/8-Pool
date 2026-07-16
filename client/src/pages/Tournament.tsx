import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGameStore } from '../store/useGameStore';
import socketService from '../socket/socket';
import { SOCKET_EVENTS } from '../socket/socketEvents';

interface MatchPlayer {
  _id: string;
  username: string;
  avatar: string;
}

interface BracketMatch {
  matchId: string;
  round: 'semi-final' | 'final';
  player1: MatchPlayer;
  player2: MatchPlayer;
  winner?: MatchPlayer | null;
  roomId?: string | null;
  status: 'pending' | 'playing' | 'completed';
}

interface TournamentData {
  tournamentId: string;
  name: string;
  registeredPlayers: MatchPlayer[];
  status: 'registration' | 'semi-final' | 'final' | 'completed';
  matches: BracketMatch[];
  champion?: MatchPlayer | null;
}

export const Tournament: React.FC = () => {
  const user = useGameStore((state) => state.user);
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    socketService.connect(token);

    const socket = socketService.getSocket();
    if (socket) {
      // 1. Request initial bracket snapshot
      socket.emit(SOCKET_EVENTS.GET_TOURNAMENT_BRACKET);

      // 2. Setup listeners
      socket.on(SOCKET_EVENTS.TOURNAMENT_UPDATED, (data: TournamentData) => {
        setTournament(data);
        setLoading(false);
        setError(null);
      });

      socket.on(SOCKET_EVENTS.TOURNAMENT_ERROR, (errData: { message: string }) => {
        setError(errData.message);
        setLoading(false);
      });
    }

    return () => {
      if (socket) {
        socket.off(SOCKET_EVENTS.TOURNAMENT_UPDATED);
        socket.off(SOCKET_EVENTS.TOURNAMENT_ERROR);
      }
    };
  }, [navigate]);

  // Entrance animations using GSAP
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.bracket-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [loading]);

  const handleJoin = () => {
    setError(null);
    socketService.emit(SOCKET_EVENTS.JOIN_TOURNAMENT, {});
  };

  const handleLeave = () => {
    setError(null);
    socketService.emit(SOCKET_EVENTS.LEAVE_TOURNAMENT, {});
  };

  const handleEnterMatch = (roomId: string) => {
    navigate(`/game/${roomId}`);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <div className="text-5xl mb-6 animate-bounce">🏆</div>
        <p className="text-slate-400 font-display text-sm font-semibold tracking-wide uppercase animate-pulse">
          Loading Tournament Bracket...
        </p>
      </div>
    );
  }

  const isUserRegistered = tournament?.registeredPlayers.some((p) => p._id === user?.id);

  // Helper to render visual players in brackets
  const renderPlayerRow = (player: MatchPlayer | undefined, isWinner: boolean) => {
    if (!player) {
      return (
        <div className="flex items-center gap-2 p-2 bg-slate-950/40 text-slate-600 rounded-lg text-xs italic">
          <span>👤</span> TBD (Waiting for Player)
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-between p-2 rounded-lg text-xs ${
        isWinner ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' : 'bg-slate-950/60 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <span>{player.avatar === 'avatar_1' ? '👤' : player.avatar || '👤'}</span>
          <span className="font-semibold truncate max-w-28">{player.username}</span>
        </div>
        {isWinner && <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">WIN</span>}
      </div>
    );
  };

  const sf1 = tournament?.matches.find((m) => m.matchId === 'SF_MATCH_1');
  const sf2 = tournament?.matches.find((m) => m.matchId === 'SF_MATCH_2');
  const finalMatch = tournament?.matches.find((m) => m.matchId === 'FINAL_MATCH');

  const isUserInMatch = (match: BracketMatch | undefined) => {
    if (!match || !user) return false;
    return match.player1?._id === user.id || match.player2?._id === user.id;
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto w-full px-4 py-8 opacity-0">
      {error && (
        <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-xl text-sm font-body text-center flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-xs hover:text-white">✕</button>
        </div>
      )}

      {/* Header Info Panel */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
        {/* Subtle decorative background lights */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-pool-purple/5 blur-3xl pointer-events-none" />
        
        <div className="text-center md:text-left space-y-2 relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="text-3xl">🏆</span>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r from-pool-cyan to-pool-purple uppercase">
              {tournament?.name}
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-body max-w-lg">
            Compete in a 4-player knockout bracket. The registration automates into active semi-finals and final rounds immediately.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold font-display uppercase tracking-wider text-slate-500">
            <span>Status: <span className="text-pool-cyan">{tournament?.status}</span></span>
            <span>•</span>
            <span>Registered: <span className="text-pool-purple">{tournament?.registeredPlayers.length}/4 Players</span></span>
          </div>
        </div>

        {/* Action Registration Button */}
        <div className="relative z-10 shrink-0">
          {tournament?.status === 'registration' ? (
            isUserRegistered ? (
              <button
                onClick={handleLeave}
                className="py-3 px-6 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 font-display font-extrabold text-xs uppercase tracking-widest rounded-xl transition duration-200 cursor-pointer"
              >
                Deregister 🚫
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="py-3.5 px-8 bg-gradient-to-r from-pool-cyan to-pool-purple hover:brightness-110 text-slate-950 font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition duration-200 cursor-pointer"
              >
                Register & Join 🕹️
              </button>
            )
          ) : (
            <div className="py-2.5 px-5 bg-white/5 border border-white/10 text-slate-400 font-display font-bold text-xs uppercase tracking-widest rounded-xl">
              Registration Closed 🔒
            </div>
          )}
        </div>
      </div>

      {/* Visual Bracket Grid */}
      <div className="p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center">
          
          {/* Column 1: Semi-Finals */}
          <div className="flex flex-col gap-12 justify-center h-full">
            
            {/* SF Match 1 Box */}
            <div className="bracket-card p-4 bg-slate-900 border border-white/10 rounded-xl relative hover:border-pool-cyan/30 transition duration-300 min-h-[140px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[9px] font-black tracking-widest text-slate-500 font-display uppercase mb-2">
                  <span>Semi-Final 1</span>
                  <span className={sf1?.status === 'playing' ? 'text-pool-cyan animate-pulse' : 'text-slate-600'}>
                    {sf1?.status || 'Waiting'}
                  </span>
                </div>
                <div className="space-y-2">
                  {renderPlayerRow(sf1?.player1, sf1?.winner?._id === sf1?.player1?._id)}
                  {renderPlayerRow(sf1?.player2, sf1?.winner?._id === sf1?.player2?._id)}
                </div>
              </div>
              
              {sf1 && sf1.status !== 'completed' && isUserInMatch(sf1) && (
                <button
                  onClick={() => handleEnterMatch(sf1.roomId || '')}
                  className="mt-3 w-full py-1.5 bg-pool-cyan hover:bg-pool-cyan/95 active:scale-95 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider rounded-lg shadow transition cursor-pointer"
                >
                  Enter Match 🎮
                </button>
              )}
            </div>

            {/* SF Match 2 Box */}
            <div className="bracket-card p-4 bg-slate-900 border border-white/10 rounded-xl relative hover:border-pool-cyan/30 transition duration-300 min-h-[140px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[9px] font-black tracking-widest text-slate-500 font-display uppercase mb-2">
                  <span>Semi-Final 2</span>
                  <span className={sf2?.status === 'playing' ? 'text-pool-cyan animate-pulse' : 'text-slate-600'}>
                    {sf2?.status || 'Waiting'}
                  </span>
                </div>
                <div className="space-y-2">
                  {renderPlayerRow(sf2?.player1, sf2?.winner?._id === sf2?.player1?._id)}
                  {renderPlayerRow(sf2?.player2, sf2?.winner?._id === sf2?.player2?._id)}
                </div>
              </div>

              {sf2 && sf2.status !== 'completed' && isUserInMatch(sf2) && (
                <button
                  onClick={() => handleEnterMatch(sf2.roomId || '')}
                  className="mt-3 w-full py-1.5 bg-pool-cyan hover:bg-pool-cyan/95 active:scale-95 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider rounded-lg shadow transition cursor-pointer"
                >
                  Enter Match 🎮
                </button>
              )}
            </div>

          </div>

          {/* Column 2: Finals */}
          <div className="flex flex-col justify-center items-center h-full relative">
            {/* Visual connecting lines */}
            <div className="hidden md:block absolute left-0 w-8 h-24 border-t-2 border-b-2 border-r-2 border-white/10 rounded-r-xl -translate-x-full pointer-events-none" />
            <div className="hidden md:block absolute right-0 w-8 h-0 border-t-2 border-white/10 translate-x-full pointer-events-none" />

            {/* Final Match Box */}
            <div className="bracket-card p-4 bg-slate-900 border-2 border-pool-purple/30 rounded-xl relative hover:border-pool-purple/60 transition duration-300 min-h-[140px] w-full md:max-w-[260px] flex flex-col justify-between shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div>
                <div className="flex justify-between items-center text-[9px] font-black tracking-widest text-pool-purple font-display uppercase mb-2">
                  <span>Final Match</span>
                  <span className={finalMatch?.status === 'playing' ? 'text-pool-purple animate-pulse' : 'text-slate-600'}>
                    {finalMatch?.status || 'Waiting'}
                  </span>
                </div>
                <div className="space-y-2">
                  {renderPlayerRow(finalMatch?.player1, finalMatch?.winner?._id === finalMatch?.player1?._id)}
                  {renderPlayerRow(finalMatch?.player2, finalMatch?.winner?._id === finalMatch?.player2?._id)}
                </div>
              </div>

              {finalMatch && finalMatch.status !== 'completed' && isUserInMatch(finalMatch) && (
                <button
                  onClick={() => handleEnterMatch(finalMatch.roomId || '')}
                  className="mt-3 w-full py-1.5 bg-pool-purple hover:bg-pool-purple/95 active:scale-95 text-white font-display font-black text-[10px] uppercase tracking-wider rounded-lg shadow transition cursor-pointer"
                >
                  Enter Match 🎮
                </button>
              )}
            </div>

          </div>

          {/* Column 3: Champion Crown */}
          <div className="flex flex-col justify-center items-center h-full">
            <div className="bracket-card p-6 bg-gradient-to-b from-amber-500/5 to-slate-950/80 border border-amber-500/25 rounded-2xl shadow-xl text-center w-full max-w-[240px] flex flex-col items-center justify-center gap-3 relative overflow-hidden shadow-amber-500/5">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
              
              <span className="text-4xl animate-bounce">👑</span>
              <h4 className="text-[10px] font-black tracking-widest text-amber-400 font-display uppercase">
                Tournament Champion
              </h4>
              
              {tournament?.champion ? (
                <div className="space-y-1">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20">
                    <span>{tournament.champion.avatar === 'avatar_1' ? '👤' : tournament.champion.avatar || '👤'}</span>
                  </div>
                  <div className="text-sm font-bold text-white font-display truncate max-w-[180px]">
                    {tournament.champion.username}
                  </div>
                  <div className="text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                    Crowned Winner
                  </div>
                </div>
              ) : (
                <div className="py-4 text-xs italic text-slate-500 font-body">
                  Bracket In Progress
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tournament;
