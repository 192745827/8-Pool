import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import RoomList from '../components/RoomList';
import JoinRoomModal from '../components/JoinRoomModal';
import CreateRoomButton from '../components/CreateRoomButton';
import socketService from '../socket/socket';
import { SOCKET_EVENTS } from '../socket/socketEvents';
import { GameRoom } from '@pool/shared';

export const Lobby: React.FC = () => {
  const setRoom = useGameStore((state) => state.setRoom);
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch public rooms list
  const fetchPublicRooms = useCallback(async () => {
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
  }, []);

  // Initial rooms fetch and socket initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPublicRooms();
    }, 0);

    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }

    const socket = socketService.getSocket();
    if (socket) {
      socket.on(SOCKET_EVENTS.ROOM_CREATED, (room) => {
        setRoom(room);
        setIsActionLoading(false);
        navigate(`/game/${room.roomId}`);
      });
      socket.on(SOCKET_EVENTS.ROOM_ERROR, (errData) => {
        setError(errData.message);
        setIsActionLoading(false);
        setJoiningRoomId(null);
      });
    }

    return () => {
      clearTimeout(timer);
      if (socket) {
        socket.off(SOCKET_EVENTS.ROOM_CREATED);
        socket.off(SOCKET_EVENTS.ROOM_ERROR);
      }
    };
  }, [navigate, setRoom, fetchPublicRooms]);

  const handleCreateRoom = useCallback((isPrivate: boolean) => {
    setIsActionLoading(true);
    setError(null);
    socketService.emit(SOCKET_EVENTS.CREATE_ROOM, { isPrivate });
  }, []);

  const handleJoinRoom = useCallback(async (roomId: string) => {
    setJoiningRoomId(roomId);
    setError(null);
    
    const socket = socketService.getSocket();
    if (!socket) {
      setError('Socket connection not established. Reconnecting...');
      setJoiningRoomId(null);
      return;
    }

    const handleUpdated = (room: any) => {
      setRoom(room);
      setJoiningRoomId(null);
      navigate(`/game/${room.roomId}`);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleUpdated);
      socket.off(SOCKET_EVENTS.ROOM_ERROR, handleError);
    };

    const handleError = (errData: any) => {
      setError(errData.message);
      setJoiningRoomId(null);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleUpdated);
      socket.off(SOCKET_EVENTS.ROOM_ERROR, handleError);
    };

    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleUpdated);
    socket.on(SOCKET_EVENTS.ROOM_ERROR, handleError);

    socketService.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: roomId.trim().toUpperCase() });
  }, [navigate, setRoom]);

  const handleSpectate = useCallback((roomId: string) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleUpdated = (room: any) => {
      setRoom(room);
      navigate(`/game/${room.roomId}`);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleUpdated);
    };

    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleUpdated);
    socketService.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: roomId.trim().toUpperCase(), asSpectator: true });
  }, [navigate, setRoom]);

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
              <CreateRoomButton
                isPrivate={false}
                onClick={() => handleCreateRoom(false)}
                isLoading={isActionLoading}
                className="w-full bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:brightness-110 active:scale-95 text-pool-dark hover:border-transparent"
              />
              
              <CreateRoomButton
                isPrivate={true}
                onClick={() => handleCreateRoom(true)}
                isLoading={isActionLoading}
                className="w-full"
              />

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
              onSpectate={handleSpectate}
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
