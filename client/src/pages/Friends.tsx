import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '../services/api';
import socketService from '../socket/socket';
import { SOCKET_EVENTS } from '../socket/socketEvents';

interface UserSummary {
  _id: string;
  username: string;
  avatar: string;
  rank?: string;
  wins?: number;
  losses?: number;
  coins?: number;
}

interface FriendItem {
  friendshipId: string;
  user: UserSummary;
  isOnline: boolean;
  createdAt: string;
}

interface FriendRequestItem {
  requestId: string;
  user: UserSummary;
  createdAt: string;
}

interface RecentlyPlayedItem {
  _id: string;
  opponent: UserSummary;
  playedAt: string;
}

export const Friends: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add' | 'recent'>('friends');

  // Data states
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Status & loading states
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  // Connect socket and fetch initial data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    socketService.connect(token);

    fetchData();

    // Socket status listener
    const socket = socketService.getSocket();
    if (socket) {
      const handleStatusChange = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
        setFriends((prev) =>
          prev.map((f) => (f.user._id === userId ? { ...f, isOnline } : f))
        );
      };

      socket.on(SOCKET_EVENTS.FRIEND_STATUS_CHANGE, handleStatusChange);

      return () => {
        socket.off(SOCKET_EVENTS.FRIEND_STATUS_CHANGE, handleStatusChange);
      };
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes, recentRes] = await Promise.all([
        api.get('/api/friends'),
        api.get('/api/friends/requests'),
        api.get('/api/friends/recently-played'),
      ]);

      setFriends(friendsRes.data);
      setIncomingRequests(requestsRes.data.incoming || []);
      setOutgoingRequests(requestsRes.data.outgoing || []);
      setRecentlyPlayed(recentRes.data || []);
    } catch (err: any) {
      console.error('Failed to load friend system data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Live user search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/api/friends/search-users?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showFeedback = (text: string, isError = false) => {
    setActionMessage({ text, isError });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Actions
  const handleSendRequest = async (targetUsername: string) => {
    try {
      const res = await api.post('/api/friends/request', { targetUsername });
      showFeedback(res.data.message || 'Friend request sent!');
      fetchData();
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Failed to send request', true);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const res = await api.post('/api/friends/respond', { requestId, action });
      showFeedback(res.data.message || `Request ${action}ed`);
      fetchData();
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Failed to respond to request', true);
    }
  };

  const handleRemoveFriend = async (friendId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to remove ${username} from your friends?`)) return;

    try {
      await api.delete(`/api/friends/${friendId}`);
      showFeedback(`${username} removed from friends`);
      fetchData();
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Failed to remove friend', true);
    }
  };

  const handleInviteFriend = async (friend: UserSummary) => {
    setInvitingFriendId(friend._id);
    try {
      // Create a private room for invite
      const res = await api.post('/api/rooms/create', { isPrivate: true });
      const room = res.data;

      // Emit invitation to friend via socket
      socketService.emit(SOCKET_EVENTS.SEND_FRIEND_INVITE, {
        targetUserId: friend._id,
        roomId: room.roomId,
      });

      showFeedback(`Invitation sent to ${friend.username}! Redirecting to game room...`);
      setTimeout(() => {
        navigate(`/game/${room.roomId}`);
      }, 1500);
    } catch (err: any) {
      showFeedback(err.response?.data?.message || 'Failed to create room invite', true);
      setInvitingFriendId(null);
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
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
              👥 Friend System
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Connect with players, send game invites, and manage your online friends list.
            </p>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium border backdrop-blur-md transition-all ${
              actionMessage.isError
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            👥 Friends List ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            📩 Requests
            {incomingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-pink-500 text-white rounded-full">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            🔍 Add Friend
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'recent'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            🕒 Recently Played ({recentlyPlayed.length})
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Syncing friends network...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: FRIENDS LIST */}
            {activeTab === 'friends' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.length === 0 ? (
                  <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                    <p className="text-slate-400 text-base font-medium">No friends added yet!</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Search for players using the <span className="text-cyan-400">Add Friend</span> tab or invite recently played opponents.
                    </p>
                  </div>
                ) : (
                  friends.map((item) => (
                    <div
                      key={item.friendshipId}
                      className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5">
                            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xl font-bold">
                              {item.user.avatar === 'avatar_1' ? '👤' : item.user.avatar || '👤'}
                            </div>
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                              item.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'
                            }`}
                            title={item.isOnline ? 'Online' : 'Offline'}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">{item.user.username}</h3>
                            <span className="text-[10px] px-2 py-0.5 font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
                              {item.user.rank || 'Player'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {item.isOnline ? (
                              <span className="text-emerald-400 font-medium">Online</span>
                            ) : (
                              'Offline'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isOnline && (
                          <button
                            onClick={() => handleInviteFriend(item.user)}
                            disabled={invitingFriendId === item.user._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                          >
                            {invitingFriendId === item.user._id ? 'Inviting...' : '🎮 Invite'}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveFriend(item.user._id, item.user.username)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove Friend"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: FRIEND REQUESTS */}
            {activeTab === 'requests' && (
              <div className="space-y-8">
                {/* Incoming */}
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Incoming Requests ({incomingRequests.length})
                  </h2>
                  {incomingRequests.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No pending incoming requests.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {incomingRequests.map((req) => (
                        <div
                          key={req.requestId}
                          className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                              👤
                            </div>
                            <div>
                              <p className="font-bold text-white">{req.user.username}</p>
                              <p className="text-xs text-slate-400">Rank: {req.user.rank || 'Beginner'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRespond(req.requestId, 'accept')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(req.requestId, 'reject')}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-300 transition-all"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outgoing */}
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Sent Requests ({outgoingRequests.length})
                  </h2>
                  {outgoingRequests.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No pending sent requests.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {outgoingRequests.map((req) => (
                        <div
                          key={req.requestId}
                          className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                              👤
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{req.user.username}</p>
                              <p className="text-xs text-slate-500">Pending response...</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ADD FRIEND */}
            {activeTab === 'add' && (
              <div className="max-w-xl">
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search player by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-4 w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                <div className="space-y-3">
                  {searchResults.map((user) => {
                    const isAlreadyFriend = friends.some((f) => f.user._id === user._id);
                    const isPending = outgoingRequests.some((r) => r.user._id === user._id);

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 p-0.5">
                            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-bold">
                              👤
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.username}</p>
                            <p className="text-xs text-slate-400">Rank: {user.rank || 'Beginner'}</p>
                          </div>
                        </div>

                        {isAlreadyFriend ? (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            ✓ Friend
                          </span>
                        ) : isPending ? (
                          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                            Pending
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(user.username)}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-md shadow-pink-500/20 transition-all"
                          >
                            + Add Friend
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-6">No users found matching "{searchQuery}".</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: RECENTLY PLAYED */}
            {activeTab === 'recent' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentlyPlayed.length === 0 ? (
                  <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                    <p className="text-slate-400 text-base font-medium">No recent opponents!</p>
                    <p className="text-slate-500 text-xs mt-1">Play multiplayer 8-ball matches to build your recently played list.</p>
                  </div>
                ) : (
                  recentlyPlayed.map((item) => {
                    const isAlreadyFriend = friends.some((f) => f.user._id === item.opponent._id);
                    const isPending = outgoingRequests.some((r) => r.user._id === item.opponent._id);

                    return (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold">
                            👤
                          </div>
                          <div>
                            <p className="font-bold text-white">{item.opponent.username}</p>
                            <p className="text-xs text-slate-400">
                              Played: {new Date(item.playedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {isAlreadyFriend ? (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            ✓ Friend
                          </span>
                        ) : isPending ? (
                          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                            Pending
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(item.opponent.username)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all"
                          >
                            + Add Friend
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;
