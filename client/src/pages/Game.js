import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import PlayerCard from '../components/PlayerCard';
export const Game = () => {
    const { roomId } = useParams();
    const currentRoom = useGameStore((state) => state.currentRoom);
    const setRoom = useGameStore((state) => state.setRoom);
    const user = useGameStore((state) => state.user);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(false);
    // Polling interval reference
    const pollingRef = useRef(null);
    // Fetch initial room details on mount or roomId change
    useEffect(() => {
        const fetchRoomDetails = async () => {
            if (!roomId)
                return;
            setIsLoading(true);
            setError(null);
            try {
                const res = await api.get(`/api/rooms/${roomId}`);
                setRoom(res.data);
            }
            catch (err) {
                console.error('Error fetching room details:', err);
                setError(err.response?.data?.error || err.message || 'Room not found.');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchRoomDetails();
    }, [roomId, setRoom]);
    // Polling effect: poll every 3 seconds to keep room details in sync
    useEffect(() => {
        if (roomId) {
            if (pollingRef.current)
                clearInterval(pollingRef.current);
            const poll = async () => {
                try {
                    const res = await api.get(`/api/rooms/${roomId}`);
                    const updatedRoom = res.data;
                    if (updatedRoom.status === 'ended') {
                        setRoom(null);
                        setError('The host has ended this room.');
                        if (pollingRef.current)
                            clearInterval(pollingRef.current);
                        return;
                    }
                    setRoom(updatedRoom);
                }
                catch (err) {
                    console.error('Error polling room status:', err);
                    // If the room was deleted, kick out
                    setRoom(null);
                    setError('Room has been closed. Returning to dashboard.');
                    if (pollingRef.current)
                        clearInterval(pollingRef.current);
                }
            };
            pollingRef.current = setInterval(poll, 3000);
        }
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [roomId, setRoom]);
    const handleLeaveRoom = async () => {
        if (!roomId)
            return;
        setIsActionLoading(true);
        try {
            await api.post('/api/rooms/leave', { roomId });
            setRoom(null);
            navigate('/dashboard');
        }
        catch (err) {
            console.error('Error leaving room:', err);
            // force clean local state and redirect
            setRoom(null);
            navigate('/dashboard');
        }
        finally {
            setIsActionLoading(false);
        }
    };
    const handleCopyCode = () => {
        if (!roomId)
            return;
        navigator.clipboard.writeText(roomId);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };
    if (isLoading) {
        return (_jsxs("div", { className: "max-w-md mx-auto text-center py-24", children: [_jsx("div", { className: "text-5xl mb-6 animate-bounce", children: "\uD83C\uDFB1" }), _jsx("p", { className: "text-slate-400 font-display text-sm font-semibold tracking-wide uppercase", children: "Loading game room details..." })] }));
    }
    if (error || !currentRoom) {
        return (_jsxs("div", { className: "max-w-md mx-auto text-center py-20 px-6 bg-slate-900 border border-white/10 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-4xl block mb-4", children: "\u26A0\uFE0F" }), _jsx("h3", { className: "text-lg font-bold font-display text-white", children: "Lobby Error" }), _jsx("p", { className: "text-xs text-slate-400 font-body mt-2 leading-relaxed", children: error || 'Unable to join the room.' }), _jsx(Link, { to: "/dashboard", className: "mt-6 inline-block py-2.5 px-6 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 text-pool-dark font-display font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition", children: "Return to Dashboard" })] }));
    }
    const host = typeof currentRoom.host === 'object' ? currentRoom.host : null;
    const guest = typeof currentRoom.guest === 'object' ? currentRoom.guest : null;
    return (_jsx("div", { className: "max-w-2xl mx-auto w-full px-4 py-8", children: _jsxs("div", { className: "p-8 bg-slate-900 border border-white/10 rounded-2xl shadow-xl relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-64 h-64 rounded-full bg-pool-cyan/5 blur-3xl pointer-events-none" }), _jsxs("div", { className: "text-center mb-8", children: [_jsx("span", { className: "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/35 rounded-full select-none", children: "Match Waiting Room" }), _jsxs("h2", { className: "text-3xl font-extrabold font-display text-white mt-4 tracking-wide", children: ["ROOM CODE: ", _jsx("span", { className: "text-pool-cyan select-all", children: currentRoom.roomId })] }), _jsxs("div", { className: "flex justify-center items-center gap-3 mt-3", children: [_jsx("button", { onClick: handleCopyCode, className: "py-1 px-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-xs font-semibold text-slate-300 transition duration-300 font-display flex items-center gap-1.5 active:scale-95", children: copyFeedback ? '✓ Copied' : '📋 Copy Code' }), _jsx("span", { className: "text-slate-600 font-display", children: "|" }), _jsx("span", { className: "text-slate-400 font-body text-xs", children: currentRoom.isPrivate ? '🔒 Private Room' : '🌐 Public Room' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { children: [_jsx("div", { className: "text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2", children: "Player 1 (Host)" }), _jsx(PlayerCard, { user: host, isHost: true, label: "P1" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2", children: "Player 2 (Opponent)" }), _jsx(PlayerCard, { user: guest, isHost: false, label: "P2" })] })] }), _jsx("div", { className: "p-4 bg-slate-950 border border-white/5 rounded-xl text-center mb-6", children: guest ? (_jsxs("div", { children: [_jsx("p", { className: "text-emerald-400 font-display font-semibold text-sm animate-pulse", children: "Opponent Joined! Match Ready." }), _jsx("p", { className: "text-[11px] text-slate-500 font-body mt-1 leading-normal", children: "Wait for host to initialize the match session." })] })) : (_jsxs("div", { children: [_jsxs("p", { className: "text-pool-cyan font-display font-semibold text-sm flex items-center justify-center gap-2", children: [_jsx("span", { className: "inline-block w-2 h-2 bg-pool-cyan rounded-full animate-ping" }), "Waiting for an opponent to join..."] }), _jsx("p", { className: "text-[11px] text-slate-500 font-body mt-1 leading-normal", children: "Give friends the code above or keep it public for matchmaking." })] })) }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: handleLeaveRoom, disabled: isActionLoading, className: "w-1/2 py-3.5 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-slate-300 font-display font-bold text-xs rounded-xl shadow transition duration-300 transform active:scale-95 disabled:opacity-50", children: isActionLoading ? 'Leaving...' : '🚪 Leave Room' }), _jsx("button", { disabled: true, className: "w-1/2 py-3.5 bg-slate-900 border border-white/5 text-slate-600 font-display font-bold text-xs rounded-xl shadow-inner cursor-not-allowed text-center flex items-center justify-center gap-2", children: "\u2694\uFE0F Start Game (Coming Soon)" })] })] }) }));
};
export default Game;
