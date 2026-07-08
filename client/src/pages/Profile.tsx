import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';

interface UserProfile {
  _id: string;
  username: string;
  email?: string;
  avatar: string;
  coins: number;
  xp: number;
  wins: number;
  losses: number;
  rank: string;
  createdAt: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await api.get('/api/users/me');
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProfile();
  }, [navigate]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await api.get(`/api/users/${searchUsername.trim()}`);
      setSearchResult(res.data);
    } catch (err: any) {
      console.error('Search error:', err);
      const msg = err.response?.data?.error || 'Player not found.';
      setSearchError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-4xl mb-4 animate-spin">🎱</div>
        <p className="text-slate-400 font-body text-sm font-semibold tracking-wide uppercase">
          Loading player profile...
        </p>
      </div>
    );
  }

  const myGamesPlayed = (profile?.wins || 0) + (profile?.losses || 0);
  const myWinRate = myGamesPlayed > 0 
    ? Math.round(((profile?.wins || 0) / myGamesPlayed) * 100) 
    : 0;

  const searchGamesPlayed = searchResult 
    ? searchResult.wins + searchResult.losses 
    : 0;
  const searchWinRate = searchGamesPlayed > 0 
    ? Math.round(((searchResult?.wins || 0) / searchGamesPlayed) * 100) 
    : 0;

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-8 px-6 py-8">
      {/* Search Bar */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold tracking-wider font-display text-white mb-4 uppercase">
          🔍 Lookup Player Stats
        </h3>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Enter username to search"
            className="flex-grow px-4 py-2 bg-pool-dark/50 border border-white/10 focus:border-pool-cyan focus:outline-none rounded-xl text-white font-body text-sm"
          />
          <button
            type="submit"
            className="py-2 px-6 bg-pool-cyan hover:bg-pool-cyan/90 text-pool-dark font-display font-bold rounded-xl shadow-lg transition-all"
          >
            Search
          </button>
        </form>

        {searchError && (
          <div className="mt-4 text-rose-400 text-sm font-semibold">
            ❌ {searchError}
          </div>
        )}

        {searchResult && (
          <div className="mt-6 p-4 bg-pool-dark/50 border border-white/5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-bold text-pool-cyan font-display">
                Player Found: {searchResult.username}
              </h4>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/20 rounded-md">
                {searchResult.rank}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-pool-dark/40 border border-white/5 rounded-lg text-center">
                <div className="text-[10px] text-slate-500 font-display uppercase">Coins</div>
                <div className="text-lg font-extrabold text-amber-400 font-display mt-0.5">🪙 {searchResult.coins}</div>
              </div>
              <div className="p-3 bg-pool-dark/40 border border-white/5 rounded-lg text-center">
                <div className="text-[10px] text-slate-500 font-display uppercase">XP</div>
                <div className="text-lg font-extrabold text-pool-purple font-display mt-0.5">✨ {searchResult.xp}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center border-t border-white/5 pt-3">
              <div>
                <div className="text-[10px] text-slate-500 font-display uppercase">Games</div>
                <div className="text-md font-bold text-white font-display mt-0.5">{searchGamesPlayed}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-display uppercase">Wins</div>
                <div className="text-md font-bold text-emerald-400 font-display mt-0.5">{searchResult.wins}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-display uppercase">Losses</div>
                <div className="text-md font-bold text-rose-400 font-display mt-0.5">{searchResult.losses}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-display uppercase">Win Rate</div>
                <div className="text-md font-bold text-pool-cyan font-display mt-0.5">{searchWinRate}%</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 text-center font-body border-t border-white/5 pt-3">
              Member Since: {new Date(searchResult.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold tracking-wider font-display text-white uppercase">
            👤 Your Player Profile
          </h3>
          <Link
            to="/dashboard"
            className="text-xs text-pool-cyan hover:underline font-semibold font-display uppercase"
          >
            Back to Dashboard
          </Link>
        </div>

        {profile && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-pool-purple/20 border border-pool-purple/35 flex items-center justify-center text-3xl shadow-lg shadow-pool-purple/10">
                🎱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-2xl font-extrabold text-white font-display leading-none">
                    {profile.username}
                  </h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-pool-purple/20 text-pool-purple border border-pool-purple/30 rounded-md font-display uppercase tracking-wide">
                    {profile.rank}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1.5 font-body">
                  Email: {profile.email}
                </p>
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-pool-dark/30 border border-white/5 rounded-xl text-center">
                <div className="text-xs text-slate-500 font-display font-semibold uppercase">Total Coins</div>
                <div className="text-2xl font-extrabold text-amber-400 font-display mt-1">🪙 {profile.coins.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-pool-dark/30 border border-white/5 rounded-xl text-center">
                <div className="text-xs text-slate-500 font-display font-semibold uppercase">Experience (XP)</div>
                <div className="text-2xl font-extrabold text-pool-purple font-display mt-1">✨ {profile.xp}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center border-t border-white/5 pt-4">
              <div>
                <div className="text-[10px] text-slate-500 font-display font-semibold uppercase">Played</div>
                <div className="text-xl font-extrabold text-white font-display mt-1">{myGamesPlayed}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-display font-semibold uppercase">Wins</div>
                <div className="text-xl font-extrabold text-emerald-400 font-display mt-1">{profile.wins}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-display font-semibold uppercase">Losses</div>
                <div className="text-xl font-extrabold text-rose-400 font-display mt-1">{profile.losses}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-display font-semibold uppercase">Win Rate</div>
                <div className="text-xl font-extrabold text-pool-cyan font-display mt-1">{myWinRate}%</div>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 font-body border-t border-white/5 pt-4">
              Account created on {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
