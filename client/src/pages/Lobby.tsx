import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import PlayerCard from '../components/common/PlayerCard';
import RoomList from '../components/common/RoomList';
import JoinRoomModal from '../components/common/JoinRoomModal';
import { GameRoom, SharedUser } from '@pool/shared';

export const Lobby: React.FC = () => {
  const currentRoom = useGameStore((state) => state.currentRoom);
  const setRoom = useGameStore((state) => state.setRoom);
  const user = useGameStore((state) => state.user);
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Polling interval ref
  const pollingRef = useRef<any>(null);

  // Fetch public rooms list
  const fetchPublicRooms = async () => {
    if (currentRoom) return; // Don't fetch list if user is in a room
    setIsLoadingRooms(true);
    setError(null);
    try {
      const res = await api.get('/api/rooms');
      setRooms(res.data);
    } catch (err: any) {
      console.error('Failed to fetch rooms list:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load lobby rooms.');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Initial rooms fetch
  useEffect(() => {
    if (!currentRoom) {
      fetchPublicRooms();
    }
  }, [currentRoom]);

  // Polling effect: when in a room, poll every 3 seconds to check for guest joins/status changes
  useEffect(() => {
    if (currentRoom) {
      // Clear any pre-existing poll
      if (pollingRef.current) clearInterval(pollingRef.current);

      const pollRoomDetails = async () => {
        try {
          const res = await api.get(`/api/rooms/${currentRoom.roomId}`);
          const updatedRoom = res.data;
          
          // If room was ended by host, remove player
          if (updatedRoom.status === 'ended') {
            setRoom(null);
            setError('The host has closed this room.');
            if (pollingRef.current) clearInterval(pollingRef.current);
            return;
          }

          setRoom(updatedRoom);
        } catch (err) {
          console.error('Error polling room status:', err);
          // If room not found (e.g. deleted or closed), kick player back to lobby
          setRoom(null);
          setError('Room status could not be verified. Returning to lobby.');
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      };

      pollingRef.current = setInterval(pollRoomDetails, 3000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [currentRoom, setRoom]);

  const handleCreateRoom = async (isPrivate: boolean) => {
    setIsActionLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/rooms/create', { isPrivate });
      setRoom(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create room.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    setJoiningRoomId(roomId);
    setError(null);
    try {
      const res = await api.post('/api/rooms/join', { roomId });
      setRoom(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to join room.');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom) return;
    setIsActionLoading(true);
    try {
      await api.post('/api/rooms/leave', { roomId: currentRoom.roomId });
      setRoom(null);
    } catch (err: any) {
      console.error('Error leaving room:', err);
      // fallback: force reset local store anyway
      setRoom(null);
    } finally {
      setIsActionLoading(false);
      fetchPublicRooms();
    }
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.roomId);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // ─── WAITING ROOM VIEW ───
  if (currentRoom) {
    const host = typeof currentRoom.host === 'object' ? (currentRoom.host as SharedUser) : null;
    const guest = typeof currentRoom.guest === 'object' ? (currentRoom.guest as SharedUser) : null;
    const isCurrentUserHost = user && host && user.id === host._id;

    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-8">
        <div className="p-8 bg-slate-900 border border-white/10 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-pool-cyan/5 blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-8">
            <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/35 rounded-full select-none">
              Match Waiting Room
            </span>
            <h2 className="text-3xl font-extrabold font-display text-white mt-4 tracking-wide">
              ROOM CODE: <span className="text-pool-cyan select-all">{currentRoom.roomId}</span>
            </h2>
            <div className="flex justify-center items-center gap-3 mt-3">
              <button
                onClick={handleCopyCode}
                className="py-1 px-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-xs font-semibold text-slate-300 transition duration-300 font-display flex items-center gap-1.5 active:scale-95"
              >
                {copyFeedback ? '✓ Copied' : '📋 Copy Code'}
              </button>
              <span className="text-slate-600 font-display">|</span>
              <span className="text-slate-400 font-body text-xs">
                {currentRoom.isPrivate ? '🔒 Private Room' : '🌐 Public Room'}
              </span>
            </div>
          </div>

          {/* Players Slot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2">
                Player 1 (Host)
              </div>
              <PlayerCard user={host} isHost={true} label="P1" />
            </div>
            <div>
              <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2">
                Player 2 (Opponent)
              </div>
              <PlayerCard user={guest} isHost={false} label="P2" />
            </div>
          </div>

          {/* Status Box */}
          <div className="p-4 bg-slate-950 border border-white/5 rounded-xl text-center mb-6">
            {guest ? (
              <div>
                <p className="text-emerald-400 font-display font-semibold text-sm animate-pulse">
                   Opponent Joined! Match Ready.
                </p>
                <p className="text-[11px] text-slate-500 font-body mt-1 leading-normal">
                  Wait for host to initialize the match session.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-pool-cyan font-display font-semibold text-sm flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 bg-pool-cyan rounded-full animate-ping" />
                  Waiting for an opponent to join...
                </p>
                <p className="text-[11px] text-slate-500 font-body mt-1 leading-normal">
                  Give friends the code above or keep it public for matchmaking.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleLeaveRoom}
              disabled={isActionLoading}
              className="w-1/2 py-3.5 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-slate-300 font-display font-bold text-xs rounded-xl shadow transition duration-300 transform active:scale-95 disabled:opacity-50"
            >
              {isActionLoading ? 'Leaving...' : '🚪 Leave Room'}
            </button>
            <button
              disabled
              className="w-1/2 py-3.5 bg-slate-900 border border-white/5 text-slate-600 font-display font-bold text-xs rounded-xl shadow-inner cursor-not-allowed text-center flex items-center justify-center gap-2"
            >
              ⚔️ Start Game (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN LOBBY VIEW ───
  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      {error && (
        <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-xl text-sm font-body text-center flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-xs hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-extrabold font-display tracking-wide text-white">
            8-BALL POOL LOBBY
          </h2>
          <p className="text-xs text-slate-400 font-body mt-1">
            Create private games or browse and join public lobbies.
          </p>
        </div>
        
        {/* Quick Nav back to Dashboard */}
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-slate-400 hover:text-pool-cyan transition duration-300 font-display flex items-center gap-1"
        >
          ← Return to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Room Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-xl">
            <h3 className="text-base font-bold font-display text-white mb-4 uppercase tracking-wider">
              Lobby Controls
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleCreateRoom(false)}
                disabled={isActionLoading}
                className="py-3 px-4 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:brightness-110 active:scale-95 text-pool-dark font-display font-bold text-xs rounded-xl shadow-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>➕</span> Create Public Room
              </button>
              
              <button
                onClick={() => handleCreateRoom(true)}
                disabled={isActionLoading}
                className="py-3 px-4 bg-slate-800/80 border border-white/10 hover:border-pool-purple/45 text-white font-display font-bold text-xs rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🔒</span> Create Private Room
              </button>

              <div className="border-t border-white/5 my-2" />

              <button
                onClick={() => setIsJoinModalOpen(true)}
                disabled={isActionLoading}
                className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display font-bold text-xs rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🔑</span> Enter Room Code
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Public Lobbies List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold font-display text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              Active Lobbies
            </h3>
            <button
              onClick={fetchPublicRooms}
              disabled={isLoadingRooms}
              className="p-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition duration-300 font-display flex items-center gap-1"
            >
              {isLoadingRooms ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {isLoadingRooms ? (
            <div className="py-16 text-center">
              <div className="text-3xl animate-spin mb-4">🎱</div>
              <p className="text-xs text-slate-500 font-display uppercase tracking-widest">
                Searching public matches...
              </p>
            </div>
          ) : (
            <RoomList
              rooms={rooms}
              onJoin={handleJoinRoom}
              joiningRoomId={joiningRoomId}
              onRefresh={fetchPublicRooms}
            />
          )}
        </div>

      </div>

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinRoom}
        isJoining={joiningRoomId !== null}
      />
    </div>
  );
};

export default Lobby;
