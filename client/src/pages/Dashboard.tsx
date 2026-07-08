import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import StatsCard from '../components/common/StatsCard';
import JoinRoomModal from '../components/common/JoinRoomModal';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  coins: number;
  xp: number;
  wins: number;
  losses: number;
  rank: string;
}

export const Dashboard: React.FC = () => {
  const user = useGameStore((state) => state.user);
  const setUser = useGameStore((state) => state.setUser);
  const setRoom = useGameStore((state) => state.setRoom);
  const resetStore = useGameStore((state) => state.reset);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/me');
        setProfile(res.data);
        
        // Sync with store
        setUser({
          id: res.data._id,
          username: res.data.username,
          email: res.data.email,
          avatar: res.data.avatar,
          coins: res.data.coins,
          xp: res.data.xp,
          wins: res.data.wins,
          losses: res.data.losses,
          rank: res.data.rank,
        });
      } catch (err) {
        console.error('Auth error on dashboard:', err);
        localStorage.removeItem('token');
        resetStore();
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setUser, resetStore, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    resetStore();
    navigate('/login');
  };

  const handleQuickPlay = async () => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      // Find public lobbies
      const roomsRes = await api.get('/api/rooms');
      const publicRooms = roomsRes.data;

      if (publicRooms.length > 0) {
        // Join the first available room
        const targetRoom = publicRooms[0];
        const joinRes = await api.post('/api/rooms/join', { roomId: targetRoom.roomId });
        setRoom(joinRes.data);
        navigate('/lobby');
      } else {
        // Create a new public room
        const createRes = await api.post('/api/rooms/create', { isPrivate: false });
        setRoom(createRes.data);
        navigate('/lobby');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error || err.message || 'Failed to matchmake.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateRoom = async (isPrivate: boolean) => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      const res = await api.post('/api/rooms/create', { isPrivate });
      setRoom(res.data);
      navigate('/lobby');
    } catch (err: any) {
      setActionError(err.response?.data?.error || err.message || 'Failed to create room.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleJoinSubmit = async (roomId: string) => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      const res = await api.post('/api/rooms/join', { roomId });
      setRoom(res.data);
      navigate('/lobby');
    } catch (err: any) {
      setActionError(err.response?.data?.error || err.message || 'Failed to join room.');
      throw err; // throw back to let the modal show the error
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <div className="text-5xl mb-6 animate-bounce">🎱</div>
        <p className="text-slate-400 font-display text-sm font-semibold tracking-wide uppercase">
          Loading player profile...
        </p>
      </div>
    );
  }

  // Experience level calculation
  const xp = profile?.xp || 0;
  const level = Math.floor(xp / 1000) + 1;
  const currentXPProgress = xp % 1000;
  const xpPercent = Math.min((currentXPProgress / 1000) * 100, 100);

  // Dynamic border glow based on Rank
  const getRankGlowClass = (rankName: string = '') => {
    const name = rankName.toLowerCase();
    if (name.includes('grandmaster') || name.includes('legend')) return 'border-amber-500 shadow-amber-500/25';
    if (name.includes('master') || name.includes('pro')) return 'border-pool-purple shadow-pool-purple/25';
    return 'border-pool-cyan shadow-pool-cyan/20';
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      {actionError && (
        <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-xl text-sm font-body text-center flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs hover:text-white">✕</button>
        </div>
      )}

      {/* Main Profile Info Section */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden">
        {/* Subtle decorative background lights */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-pool-cyan/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-pool-purple/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 w-full md:w-auto">
          {/* Glowing Avatar */}
          <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-pool-dark to-slate-800 border-2 ${getRankGlowClass(profile?.rank)} shadow-lg flex items-center justify-center text-4xl relative`}>
            <span>{profile?.avatar === 'avatar_1' ? '👤' : profile?.avatar || '👤'}</span>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pool-cyan border border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-950 font-display">
              L{level}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold tracking-wider font-display text-white">
                {profile?.username}
              </h2>
              <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/20 rounded-md">
                {profile?.rank}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1 font-body">{profile?.email}</p>

            {/* Level Progress Bar */}
            <div className="mt-3 w-56">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 font-display mb-1 uppercase tracking-wide">
                <span>LVL {level}</span>
                <span>{currentXPProgress}/1,000 XP</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-pool-cyan to-pool-purple h-full transition-all duration-500" 
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="py-2.5 px-5 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-slate-300 font-display text-xs font-semibold rounded-xl transition duration-300 shrink-0 relative z-10 self-center"
        >
          Sign Out
        </button>
      </div>

      {/* Grid containing Stats & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold font-display text-white tracking-wide border-b border-white/5 pb-2">
            🏆 Player Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              label="Coins Balance"
              value={`🪙 ${(profile?.coins || 0).toLocaleString()}`}
              icon="💰"
              description="Used to enter competitive matches and buy visual items."
              colorClass="text-amber-400"
            />
            <StatsCard
              label="Experience Points"
              value={`${profile?.xp} XP`}
              icon="✨"
              description="Play games to level up your status and show on your card."
              colorClass="text-pool-cyan"
            />
            <StatsCard
              label="Wins Record"
              value={`${profile?.wins} Matches`}
              icon="🥇"
              description="Total number of competitive matches won."
              colorClass="text-emerald-400"
            />
            <StatsCard
              label="Losses Record"
              value={`${profile?.losses} Matches`}
              icon="🥊"
              description="Matches lost in multiplayer queue rooms."
              colorClass="text-rose-400"
            />
          </div>
        </div>

        {/* Right Column: Actions Menu */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold font-display text-white tracking-wide border-b border-white/5 pb-2">
            🎮 Menu Actions
          </h3>

          <div className="flex flex-col gap-3">
            {/* Play Button */}
            <button
              onClick={handleQuickPlay}
              disabled={isActionLoading}
              className="py-4 px-6 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:shadow-lg hover:shadow-pool-cyan/15 text-pool-dark font-display font-bold text-base rounded-xl transition duration-300 transform active:scale-95 text-center flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <span>▶️</span> {isActionLoading ? 'Matching...' : 'Play Quick Match'}
            </button>

            {/* Create Room Options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCreateRoom(false)}
                disabled={isActionLoading}
                className="py-3 px-4 bg-slate-900/60 border border-white/10 hover:border-pool-purple/45 text-white font-display font-bold text-xs rounded-xl transition duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>➕</span> Create Public
              </button>
              <button
                onClick={() => handleCreateRoom(true)}
                disabled={isActionLoading}
                className="py-3 px-4 bg-slate-900/60 border border-white/10 hover:border-pool-purple/45 text-white font-display font-bold text-xs rounded-xl transition duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>🔒</span> Create Private
              </button>
            </div>

            {/* Join Room */}
            <button
              onClick={() => setIsJoinOpen(true)}
              disabled={isActionLoading}
              className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display font-bold text-xs rounded-xl transition duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>🔑</span> Join Room Code
            </button>

            {/* Subpages Links */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Link
                to="/leaderboard"
                className="py-3 px-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-display font-semibold text-[10px] uppercase tracking-wider rounded-xl transition duration-300 text-center flex flex-col items-center justify-center gap-1"
              >
                <span>🏆</span> Leaderboard
              </Link>
              <Link
                to="/profile"
                className="py-3 px-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-display font-semibold text-[10px] uppercase tracking-wider rounded-xl transition duration-300 text-center flex flex-col items-center justify-center gap-1"
              >
                <span>👤</span> Profile
              </Link>
              <Link
                to="/settings"
                className="py-3 px-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-display font-semibold text-[10px] uppercase tracking-wider rounded-xl transition duration-300 text-center flex flex-col items-center justify-center gap-1"
              >
                <span>⚙️</span> Settings
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Reusable Join Modal */}
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoinSubmit}
        isJoining={isActionLoading}
      />
    </div>
  );
};

export default Dashboard;
