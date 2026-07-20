import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../socket/socket';
import { useGameStore } from '../store/useGameStore';

interface MatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OpponentData {
  username: string;
  avatar: string;
  eloRating: number;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useGameStore();

  const [searchTime, setSearchTime] = useState<number>(0);
  const [matchState, setMatchState] = useState<'searching' | 'found' | 'error'>('searching');
  const [opponent, setOpponent] = useState<OpponentData | null>(null);
  const [foundRoomId, setFoundRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSearchTime(0);
    setMatchState('searching');
    setOpponent(null);
    setFoundRoomId(null);

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('join-matchmaking');

      const handleSearchingStatus = (data: any) => {
        if (data.status === 'cancelled') {
          onClose();
        }
      };

      const handleMatchFound = (data: { roomId: string; opponent: OpponentData }) => {
        setMatchState('found');
        setOpponent(data.opponent);
        setFoundRoomId(data.roomId);

        // Auto navigate after brief reveal
        setTimeout(() => {
          onClose();
          navigate(`/game/${data.roomId}`);
        }, 1800);
      };

      const handleMatchError = () => {
        setMatchState('error');
      };

      socket.on('searching-status', handleSearchingStatus);
      socket.on('match-found', handleMatchFound);
      socket.on('matchmaking-error', handleMatchError);

      const timer = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);

      return () => {
        clearInterval(timer);
        socket.off('searching-status', handleSearchingStatus);
        socket.off('match-found', handleMatchFound);
        socket.off('matchmaking-error', handleMatchError);
      };
    }
  }, [isOpen]);

  const handleCancel = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('leave-matchmaking');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden text-center">
        {/* Subtle neon glowing table border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 shadow-[0_0_15px_#00f0ff]" />

        {matchState === 'searching' && (
          <div className="space-y-6">
            {/* Radar Search Animation */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-lg">
                <span className="text-4xl animate-bounce">🌏</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                Finding Match...
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Matching players by ELO Rating & Rank proximity
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-400">Your Rating:</span>
              <span className="text-cyan-400 font-extrabold">{user?.eloRating || 1200} ELO ({user?.rank || 'Silver'})</span>
            </div>

            <div className="text-xs text-slate-500">
              Searching Time: <span className="text-white font-mono font-bold">{searchTime}s</span>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {matchState === 'found' && opponent && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <span className="text-4xl">🎮</span>
            </div>

            <div>
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                MATCH FOUND!
              </span>
              <h2 className="text-2xl font-black text-white mt-3">
                {opponent.username}
              </h2>
              <p className="text-xs text-cyan-400 font-bold mt-1">
                {opponent.eloRating} ELO Rating
              </p>
            </div>

            <p className="text-xs text-slate-400 animate-pulse">
              Entering Game Room <span className="text-white font-bold">{foundRoomId}</span>...
            </p>
          </div>
        )}

        {matchState === 'error' && (
          <div className="space-y-6">
            <span className="text-5xl block">⚠️</span>
            <h2 className="text-lg font-bold text-white">Matchmaking Error</h2>
            <p className="text-xs text-slate-400">Unable to join queue right now.</p>
            <button
              onClick={handleCancel}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchmakingModal;
