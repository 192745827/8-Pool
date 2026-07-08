import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import RoomList from '../components/RoomList';
import JoinRoomModal from '../components/JoinRoomModal';
import CreateRoomButton from '../components/CreateRoomButton';
export const Lobby = () => {
    const setRoom = useGameStore((state) => state.setRoom);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [joiningRoomId, setJoiningRoomId] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [error, setError] = useState(null);
    // Fetch public rooms list
    const fetchPublicRooms = async () => {
        setIsLoadingRooms(true);
        setError(null);
        try {
            const res = await api.get('/api/rooms');
            setRooms(res.data);
        }
        catch (err) {
            console.error('Failed to fetch rooms list:', err);
            setError(err.response?.data?.error || err.message || 'Failed to load lobby rooms.');
        }
        finally {
            setIsLoadingRooms(false);
        }
    };
    // Initial rooms fetch
    useEffect(() => {
        fetchPublicRooms();
    }, []);
    const handleCreateRoom = async (isPrivate) => {
        setIsActionLoading(true);
        setError(null);
        try {
            const res = await api.post('/api/rooms/create', { isPrivate });
            setRoom(res.data);
            navigate(`/game/${res.data.roomId}`);
        }
        catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to create room.');
        }
        finally {
            setIsActionLoading(false);
        }
    };
    const handleJoinRoom = async (roomId) => {
        setJoiningRoomId(roomId);
        setError(null);
        try {
            const res = await api.post('/api/rooms/join', { roomId });
            setRoom(res.data);
            navigate(`/game/${res.data.roomId}`);
        }
        catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to join room.');
        }
        finally {
            setJoiningRoomId(null);
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto w-full px-4 py-8", children: [error && (_jsxs("div", { className: "mb-6 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-xl text-sm font-body text-center flex items-center justify-between", children: [_jsxs("span", { children: ["\u26A0\uFE0F ", error] }), _jsx("button", { onClick: () => setError(null), className: "text-xs hover:text-white", children: "\u2715" })] })), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-white/5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-extrabold font-display tracking-wide text-white", children: "8-BALL POOL LOBBY" }), _jsx("p", { className: "text-xs text-slate-400 font-body mt-1", children: "Create private games or browse and join public lobbies." })] }), _jsx(Link, { to: "/dashboard", className: "text-xs font-semibold text-slate-400 hover:text-pool-cyan transition duration-300 font-display flex items-center gap-1", children: "\u2190 Return to Dashboard" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-1 space-y-6", children: _jsxs("div", { className: "p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-xl", children: [_jsx("h3", { className: "text-base font-bold font-display text-white mb-4 uppercase tracking-wider", children: "Lobby Controls" }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx(CreateRoomButton, { isPrivate: false, onClick: () => handleCreateRoom(false), isLoading: isActionLoading, className: "w-full bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:brightness-110 active:scale-95 text-pool-dark hover:border-transparent" }), _jsx(CreateRoomButton, { isPrivate: true, onClick: () => handleCreateRoom(true), isLoading: isActionLoading, className: "w-full" }), _jsx("div", { className: "border-t border-white/5 my-2" }), _jsxs("button", { onClick: () => setIsJoinModalOpen(true), disabled: isActionLoading, className: "py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display font-bold text-xs rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50", children: [_jsx("span", { children: "\uD83D\uDD11" }), " Enter Room Code"] })] })] }) }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("h3", { className: "text-base font-bold font-display text-white uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: "w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" }), "Active Lobbies"] }), _jsx("button", { onClick: fetchPublicRooms, disabled: isLoadingRooms, className: "p-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition duration-300 font-display flex items-center gap-1", children: isLoadingRooms ? 'Refreshing...' : '🔄 Refresh' })] }), isLoadingRooms ? (_jsxs("div", { className: "py-16 text-center", children: [_jsx("div", { className: "text-3xl animate-spin mb-4", children: "\uD83C\uDFB1" }), _jsx("p", { className: "text-xs text-slate-500 font-display uppercase tracking-widest", children: "Searching public matches..." })] })) : (_jsx(RoomList, { rooms: rooms, onJoin: handleJoinRoom, joiningRoomId: joiningRoomId, onRefresh: fetchPublicRooms }))] })] }), _jsx(JoinRoomModal, { isOpen: isJoinModalOpen, onClose: () => setIsJoinModalOpen(false), onJoin: handleJoinRoom, isJoining: joiningRoomId !== null })] }));
};
export default Lobby;
