import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import PlayerCard from '../components/common/PlayerCard';
import RoomList from '../components/common/RoomList';
import JoinRoomModal from '../components/common/JoinRoomModal';
export const Lobby = () => {
    const currentRoom = useGameStore((state) => state.currentRoom);
    const setRoom = useGameStore((state) => state.setRoom);
    const user = useGameStore((state) => state.user);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [joiningRoomId, setJoiningRoomId] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(false);
    // Polling interval ref
    const pollingRef = useRef(null);
    // Fetch public rooms list
    const fetchPublicRooms = async () => {
        if (currentRoom)
            return; // Don't fetch list if user is in a room
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
        if (!currentRoom) {
            fetchPublicRooms();
        }
    }, [currentRoom]);
    // Polling effect: when in a room, poll every 3 seconds to check for guest joins/status changes
    useEffect(() => {
        if (currentRoom) {
            // Clear any pre-existing poll
            if (pollingRef.current)
                clearInterval(pollingRef.current);
            const pollRoomDetails = async () => {
                try {
                    const res = await api.get(`/api/rooms/${currentRoom.roomId}`);
                    const updatedRoom = res.data;
                    // If room was ended by host, remove player
                    if (updatedRoom.status === 'ended') {
                        setRoom(null);
                        setError('The host has closed this room.');
                        if (pollingRef.current)
                            clearInterval(pollingRef.current);
                        return;
                    }
                    setRoom(updatedRoom);
                }
                catch (err) {
                    console.error('Error polling room status:', err);
                    // If room not found (e.g. deleted or closed), kick player back to lobby
                    setRoom(null);
                    setError('Room status could not be verified. Returning to lobby.');
                    if (pollingRef.current)
                        clearInterval(pollingRef.current);
                }
            };
            pollingRef.current = setInterval(pollRoomDetails, 3000);
        }
        else {
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
    const handleCreateRoom = async (isPrivate) => {
        setIsActionLoading(true);
        setError(null);
        try {
            const res = await api.post('/api/rooms/create', { isPrivate });
            setRoom(res.data);
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
        }
        catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to join room.');
        }
        finally {
            setJoiningRoomId(null);
        }
    };
    const handleLeaveRoom = async () => {
        if (!currentRoom)
            return;
        setIsActionLoading(true);
        try {
            await api.post('/api/rooms/leave', { roomId: currentRoom.roomId });
            setRoom(null);
        }
        catch (err) {
            console.error('Error leaving room:', err);
            // fallback: force reset local store anyway
            setRoom(null);
        }
        finally {
            setIsActionLoading(false);
            fetchPublicRooms();
        }
    };
    const handleCopyCode = () => {
        if (!currentRoom)
            return;
        navigator.clipboard.writeText(currentRoom.roomId);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };
    // ─── WAITING ROOM VIEW ───
    if (currentRoom) {
        const host = typeof currentRoom.host === 'object' ? currentRoom.host : null;
        const guest = typeof currentRoom.guest === 'object' ? currentRoom.guest : null;
        const isCurrentUserHost = user && host && user.id === host._id;
        return (_jsx("div", { className: "max-w-2xl mx-auto w-full px-4 py-8", children: _jsxs("div", { className: "p-8 bg-slate-900 border border-white/10 rounded-2xl shadow-xl relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-64 h-64 rounded-full bg-pool-cyan/5 blur-3xl pointer-events-none" }), _jsxs("div", { className: "text-center mb-8", children: [_jsx("span", { className: "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/35 rounded-full select-none", children: "Match Waiting Room" }), _jsxs("h2", { className: "text-3xl font-extrabold font-display text-white mt-4 tracking-wide", children: ["ROOM CODE: ", _jsx("span", { className: "text-pool-cyan select-all", children: currentRoom.roomId })] }), _jsxs("div", { className: "flex justify-center items-center gap-3 mt-3", children: [_jsx("button", { onClick: handleCopyCode, className: "py-1 px-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-xs font-semibold text-slate-300 transition duration-300 font-display flex items-center gap-1.5 active:scale-95", children: copyFeedback ? '✓ Copied' : '📋 Copy Code' }), _jsx("span", { className: "text-slate-600 font-display", children: "|" }), _jsx("span", { className: "text-slate-400 font-body text-xs", children: currentRoom.isPrivate ? '🔒 Private Room' : '🌐 Public Room' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { children: [_jsx("div", { className: "text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2", children: "Player 1 (Host)" }), _jsx(PlayerCard, { user: host, isHost: true, label: "P1" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2", children: "Player 2 (Opponent)" }), _jsx(PlayerCard, { user: guest, isHost: false, label: "P2" })] })] }), _jsx("div", { className: "p-4 bg-slate-950 border border-white/5 rounded-xl text-center mb-6", children: guest ? (_jsxs("div", { children: [_jsx("p", { className: "text-emerald-400 font-display font-semibold text-sm animate-pulse", children: "Opponent Joined! Match Ready." }), _jsx("p", { className: "text-[11px] text-slate-500 font-body mt-1 leading-normal", children: "Wait for host to initialize the match session." })] })) : (_jsxs("div", { children: [_jsxs("p", { className: "text-pool-cyan font-display font-semibold text-sm flex items-center justify-center gap-2", children: [_jsx("span", { className: "inline-block w-2 h-2 bg-pool-cyan rounded-full animate-ping" }), "Waiting for an opponent to join..."] }), _jsx("p", { className: "text-[11px] text-slate-500 font-body mt-1 leading-normal", children: "Give friends the code above or keep it public for matchmaking." })] })) }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: handleLeaveRoom, disabled: isActionLoading, className: "w-1/2 py-3.5 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-slate-300 font-display font-bold text-xs rounded-xl shadow transition duration-300 transform active:scale-95 disabled:opacity-50", children: isActionLoading ? 'Leaving...' : '🚪 Leave Room' }), _jsx("button", { disabled: true, className: "w-1/2 py-3.5 bg-slate-900 border border-white/5 text-slate-600 font-display font-bold text-xs rounded-xl shadow-inner cursor-not-allowed text-center flex items-center justify-center gap-2", children: "\u2694\uFE0F Start Game (Coming Soon)" })] })] }) }));
    }
    // ─── MAIN LOBBY VIEW ───
    return (_jsxs("div", { className: "max-w-4xl mx-auto w-full px-4 py-8", children: [error && (_jsxs("div", { className: "mb-6 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-xl text-sm font-body text-center flex items-center justify-between", children: [_jsxs("span", { children: ["\u26A0\uFE0F ", error] }), _jsx("button", { onClick: () => setError(null), className: "text-xs hover:text-white", children: "\u2715" })] })), _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-white/5", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-extrabold font-display tracking-wide text-white", children: "8-BALL POOL LOBBY" }), _jsx("p", { className: "text-xs text-slate-400 font-body mt-1", children: "Create private games or browse and join public lobbies." })] }), _jsx(Link, { to: "/dashboard", className: "text-xs font-semibold text-slate-400 hover:text-pool-cyan transition duration-300 font-display flex items-center gap-1", children: "\u2190 Return to Dashboard" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-1 space-y-6", children: _jsxs("div", { className: "p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-xl", children: [_jsx("h3", { className: "text-base font-bold font-display text-white mb-4 uppercase tracking-wider", children: "Lobby Controls" }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("button", { onClick: () => handleCreateRoom(false), disabled: isActionLoading, className: "py-3 px-4 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:brightness-110 active:scale-95 text-pool-dark font-display font-bold text-xs rounded-xl shadow-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50", children: [_jsx("span", { children: "\u2795" }), " Create Public Room"] }), _jsxs("button", { onClick: () => handleCreateRoom(true), disabled: isActionLoading, className: "py-3 px-4 bg-slate-800/80 border border-white/10 hover:border-pool-purple/45 text-white font-display font-bold text-xs rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50", children: [_jsx("span", { children: "\uD83D\uDD12" }), " Create Private Room"] }), _jsx("div", { className: "border-t border-white/5 my-2" }), _jsxs("button", { onClick: () => setIsJoinModalOpen(true), disabled: isActionLoading, className: "py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display font-bold text-xs rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50", children: [_jsx("span", { children: "\uD83D\uDD11" }), " Enter Room Code"] })] })] }) }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("h3", { className: "text-base font-bold font-display text-white uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: "w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" }), "Active Lobbies"] }), _jsx("button", { onClick: fetchPublicRooms, disabled: isLoadingRooms, className: "p-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition duration-300 font-display flex items-center gap-1", children: isLoadingRooms ? 'Refreshing...' : '🔄 Refresh' })] }), isLoadingRooms ? (_jsxs("div", { className: "py-16 text-center", children: [_jsx("div", { className: "text-3xl animate-spin mb-4", children: "\uD83C\uDFB1" }), _jsx("p", { className: "text-xs text-slate-500 font-display uppercase tracking-widest", children: "Searching public matches..." })] })) : (_jsx(RoomList, { rooms: rooms, onJoin: handleJoinRoom, joiningRoomId: joiningRoomId, onRefresh: fetchPublicRooms }))] })] }), _jsx(JoinRoomModal, { isOpen: isJoinModalOpen, onClose: () => setIsJoinModalOpen(false), onJoin: handleJoinRoom, isJoining: joiningRoomId !== null })] }));
};
export default Lobby;
